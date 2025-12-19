const FIGMA_FILE_KEY = '';
const FIGMA_TOKEN = '';

async function main() {
  console.clear();
  console.log(`🚀 Starting scan of file: ${FIGMA_FILE_KEY}...`);

  // ==================================================================
  // STEP 1: REST API - Fetch the file structure
  // ==================================================================
  const url = `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'X-Figma-Token': FIGMA_TOKEN }
  });

  if (!response.ok) {
    console.error('API Error:', response.status, response.statusText);
    return;
  }

  const json = await response.json();
  const document = json.document;
  
  // The 'components' map contains the 'key' for every component (variant) ID
  const componentMetaMap = json.components || {};

  console.log('✅ File structure fetched. Parsing tree...');

  // ==================================================================
  // STEP 2: Logic to find the keys
  // ==================================================================
  const variantsToImport = [];

  function traverse(node, pageName) {
    if (node.type === 'COMPONENT_SET') {
      // 1. We found a Component Set.
      // 2. Grab the first child (the first variant)
      const firstVariant = node.children[0];

      if (firstVariant) {
        // 3. Look up the secure 'key' for this variant ID in the metadata
        const meta = componentMetaMap[firstVariant.id];
        
        if (meta && meta.key) {
          variantsToImport.push({
            name: `${node.name} (Variant: ${firstVariant.name})`,
            key: meta.key,
            page: pageName
          });
        }
      }
    } else if (node.children) {
      node.children.forEach(child => traverse(child, pageName));
    }
  }

  // Filter pages and start traversal
  const validPages = document.children.filter(p => p.name !== "🔒 VDS Sources");
  
  validPages.forEach(page => {
    traverse(page, page.name);
  });

  console.log(`🎯 Found ${variantsToImport.length} component sets to instantiate.`);

  // ==================================================================
  // STEP 3: PLUGIN API - Instantiate in the current file
  // ==================================================================
  
  // Create a container frame to hold our new instances
  const container = figma.createFrame();
  container.name = "Imported Component Sets";
  container.layoutMode = "VERTICAL";
  container.itemSpacing = 24;
  container.paddingLeft = 40;
  container.paddingRight = 40;
  container.paddingTop = 40;
  container.paddingBottom = 40;
  container.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 } }];
  container.resize(600, 1000); // Initial size, will grow with auto-layout
  
  // Position the frame in the center of the current viewport
  container.x = figma.viewport.center.x;
  container.y = figma.viewport.center.y;
  figma.currentPage.appendChild(container);

  // Loop through and instantiate
  for (const item of variantsToImport) {
    try {
      // A. Import the component definition from the library
      const component = await figma.importComponentByKeyAsync(item.key);
      
      // B. Create an instance
      const instance = component.createInstance();
      instance.name = item.name;
      
      // C. Add to our container
      container.appendChild(instance);
      
      console.log(`Placed: ${item.name}`);
      
    } catch (err) {
      console.error(`❌ Failed to import ${item.name}: ${err.message}`);
    }
  }

  console.log('🎉 Done! Check the "Imported Component Sets" frame.');
  figma.viewport.scrollAndZoomIntoView([container]);
}

// Run the function
main();