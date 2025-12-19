// =========================================================================
// 1. SETUP CONSTANTS
// =========================================================================
const FILE_KEY = '';
const ACCESS_TOKEN = '';

// === HARDCODED TARGETS ===
// ➡️ SET THE SPECIFIC PAGE NAME YOU WANT TO PROCESS HERE:
const TARGET_PAGE_NAME = 'Button'; 
// ⬅️ Set this to a component name (e.g., 'Button', 'Dropdown Select', etc.)

// The exclusion filter remains active (VDS Sources pages will still be skipped)
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
  
 // =========================================================================
 // 3. APPLY THE FILTERING LOGIC
 // =========================================================================
 const filteredComponentSets = allComponentSets.filter(set => {
   const pageName = set.containing_frame?.pageName;
    
   // 3a. EXCLUSION FILTER (Skip VDS Sources pages)
   const passesExclusion = !pageName || !pageName.includes(EXCLUSION_TEXT);
   
    // 3b. INCLUSION FILTER (Must match the TARGET_PAGE_NAME)
    // We only keep the set if its pageName is an exact match for the constant.
    const passesInclusion = pageName === TARGET_PAGE_NAME;
    
   return passesExclusion && passesInclusion;
 });

 // 4. PRINT FILTERED RESULTS
 console.log(`\n--- Target Page Results ---`);
  console.log(`Searching for Component Sets on page: "${TARGET_PAGE_NAME}"`);
  console.log(`Excluding pages containing: "${EXCLUSION_TEXT}"`);
  
 console.log(`\nTotal Filtered Component Sets to Process: ${filteredComponentSets.length}`);
  
 let componentCount = 0;
 let pageCount = 0;
  
 // =========================================================================
 // 5. PROCESS THE TARGET COMPONENT SET(S)
 // =========================================================================
  if (filteredComponentSets.length === 0) {
      figma.notify(`⚠️ No Component Sets found matching page name "${TARGET_PAGE_NAME}"`, { error: true });
      return filteredComponentSets;
  }

 await Promise.all(filteredComponentSets.map(async (targetSetMeta) => {
   try {
      // Import the Component Set
      const importedSetNode = await figma.importComponentSetByKeyAsync(targetSetMeta.key);
     
      // Access the component variants using the synchronous 'children' property
      const componentVariants = importedSetNode.children; 
     
      // Create a new page
      const newPage = figma.createPage();
      newPage.name = `${targetSetMeta.name} (${targetSetMeta.containing_frame.pageName})`; 
      figma.currentPage = newPage; // Set the new page as the active page

      pageCount++;
     
      // Instantiate all variants on the new page
      let x = 0;
      let y = 0;
      const xSpacing = 200; 
      const ySpacing = 100; 

      // Load font once before the loop
      if (componentVariants.length > 0) {
          await figma.loadFontAsync({ family: "Inter", style: "Regular" }); 
      }
      
      // Loop through the ComponentNodes (variants)
      for (const component of componentVariants) {
          if (component.type !== "COMPONENT") continue; 

       const instance = component.createInstance();
        
       // Position the instance
       instance.x = x;
       instance.y = y;
        
       // Label the instance
       const nameText = figma.createText();
       nameText.characters = instance.name;
       nameText.x = x;
       nameText.y = y - 30; 
       newPage.appendChild(nameText);

       newPage.appendChild(instance);
       componentCount++;
        
       // Move cursor for the next instance
       x += instance.width + xSpacing;

       // Simple wrapping logic
       if (x > 1000) { 
            x = 0;
            y += instance.height + ySpacing;
       }
      }

      figma.viewport.scrollAndZoomIntoView(newPage.children);
     
   } catch (error) {
      console.error(`Could not import or process component set: ${targetSetMeta.name}`, error);
      figma.notify(`Failed to process: ${targetSetMeta.name}`, { error: true });
   }
 }));
  
 figma.notify(`✨ Created ${pageCount} pages and instantiated ${componentCount} variants for page "${TARGET_PAGE_NAME}".`, { timeout: 5000 });
 return filteredComponentSets;
}

getFilteredLibraryComponentSets();