// 1. Setup your credentials
const FILE_KEY = ''; // e.g., from the library file URL
const ACCESS_TOKEN = '';

// The text to search for, which will trigger the EXCLUSION
const EXCLUSION_TEXT = 'VDS Sources'; 
const ENDPOINT_URL = `https://api.figma.com/v1/files/${FILE_KEY}/component_sets`; 

async function getFilteredLibraryComponentSets() {
  
  // 2. Fetch the Component Set list from the REST API
  const response = await fetch(ENDPOINT_URL, {
    method: 'GET',
    headers: {
      'X-FIGMA-TOKEN': ACCESS_TOKEN
    }
  });

  const json = await response.json();

  if (json.status !== 200 && json.status !== undefined) {
    console.error('Failed to fetch Component Sets:', json.err || json.status);
    figma.notify('Failed to fetch Component Sets from Figma API.', { error: true });
    return [];
  }
  
  if (!json.meta || !json.meta.component_sets) {
    console.error('API response is missing component_sets metadata.');
    figma.notify('API response is missing component_sets metadata.', { error: true });
    return [];
  }

  // Initial array of all Component Set metadata objects
  const allComponentSets = json.meta.component_sets; 
  
  // 3. APPLY THE EXCLUSION FILTERING LOGIC
  const filteredComponentSets = allComponentSets.filter(set => {
    // Target: set.containing_frame.pageName
    const pageName = set.containing_frame?.pageName;
    
    // Logic: Keep the object if the pageName is NOT present 
    // OR if the pageName does NOT contain the exclusion text.
    const shouldKeep = !pageName || !pageName.includes(EXCLUSION_TEXT);
    
    return shouldKeep;
  });

  // 4. PRINT ALL PAGE NAMES OF THE FILTERED OBJECTS
  console.log(`\n--- Page Names of Filtered Component Sets (EXCLUDING "${EXCLUSION_TEXT}") ---`);
  
  const pageNames = filteredComponentSets
    .map(set => set.containing_frame?.pageName || '[Page Name Missing]')
    .filter((value, index, self) => self.indexOf(value) === index); // Filter out duplicates

  if (pageNames.length > 0) {
    pageNames.forEach(name => console.log(`- ${name}`));
  } else {
    console.log('No Component Sets matched the inclusion criteria.');
  }

  console.log(`\nTotal Filtered Component Sets: ${filteredComponentSets.length}`);
  
  let componentCount = 0;
  let pageCount = 0;
  
  // Use Promise.all to import all Component Sets concurrently
  await Promise.all(filteredComponentSets.map(async (targetSetMeta) => {
    try {
      // 5. Import the Component Set (returns the ComponentSetNode)
      const importedSetNode = await figma.importComponentSetByKeyAsync(targetSetMeta.key);
      
      // 6. FIX: Access the component variants using the synchronous 'children' property
      const componentVariants = importedSetNode.children; 
      
      // 7. Create a new page
      const newPage = figma.createPage();
      newPage.name = targetSetMeta.name; 
      figma.currentPage = newPage; // Set the new page as the active page

      pageCount++;
      
      // 8. Instantiate all variants on the new page
      let x = 0;
      let y = 0;
      const xSpacing = 200; // Horizontal spacing between instances
      const ySpacing = 100; // Vertical spacing between rows

      // Load font once before the loop
      if (componentVariants.length > 0) {
          // Assuming the default font is used for labels, load it once
          await figma.loadFontAsync({ family: "Inter", style: "Regular" }); 
      }
      
      // Loop through the ComponentNodes (variants)
      for (const component of componentVariants) {
          // Ensure we only try to create an instance if it's actually a ComponentNode
          if (component.type !== "COMPONENT") continue; 

          const instance = component.createInstance();
          
          // Position the instance
          instance.x = x;
          instance.y = y;
          
          // Label the instance
          const nameText = figma.createText();
          
          // Font is already loaded
          nameText.characters = instance.name;
          nameText.x = x;
          nameText.y = y - 30; // Place label above the instance
          newPage.appendChild(nameText);

          newPage.appendChild(instance);
          componentCount++;
          
          // Move cursor for the next instance
          x += instance.width + xSpacing;

          // Simple wrapping logic
          if (x > 1000) { 
              x = 0;
              // Ensure y jump accounts for the size of the instance
              y += instance.height + ySpacing;
          }
      }

      figma.viewport.scrollAndZoomIntoView(newPage.children);
      
    } catch (error) {
      console.error(`Could not import or process component set: ${targetSetMeta.name}`, error);
      figma.notify(`Failed to process: ${targetSetMeta.name}`, { error: true });
    }
  }));
  
  figma.notify(`✨ Created ${pageCount} pages and instantiated ${componentCount} variants.`, { timeout: 5000 });
  return filteredComponentSets;
}

getFilteredLibraryComponentSets();