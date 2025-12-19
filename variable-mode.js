/**
 * Finds a remote variable by name and library, imports it, and returns the local Variable object.
 * @param libraryName - Exact name of the library (e.g., "Verizon Design System")
 * @param collectionName - Exact name of the collection (e.g., "[VDS] Surface")
 * @param variableName - Exact name of the variable (e.g., "[VDS] color/surface")
 */
async function getAndImportLibraryVariable(libraryName, collectionName, variableName) {
  console.log(`🔍 Searching for variable: "${variableName}" in ${libraryName} > ${collectionName}...`);

  try {
    // 1. Get all available library collections accessible to this user
    const availableCollections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();

    // 2. Find the specific collection matching Library + Collection Name
    const targetCollection = availableCollections.find(
      (c) => c.libraryName === libraryName && c.name === collectionName
    );

    if (!targetCollection) {
      console.warn(`❌ Collection "${collectionName}" not found in library "${libraryName}".`);
      return null;
    }

    console.log(`✅ Found Collection Key: ${targetCollection.key}`);

    // 3. Get all variables inside that specific remote collection
    const variablesInCollection = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(targetCollection.key);

    // 4. Find the specific variable info by name
    const targetVarInfo = variablesInCollection.find((v) => v.name === variableName);

    if (!targetVarInfo) {
      console.warn(`❌ Variable "${variableName}" not found in collection "${collectionName}".`);
      return null;
    }

    // 5. Import the variable into the current document
    // Note: Importing a variable also locally links its Collection
    const localVariable = await figma.variables.importVariableByKeyAsync(targetVarInfo.key);
    
    console.log(`🎉 Successfully imported variable! Local ID: ${localVariable.id}`);
    return localVariable;

  } catch (error) {
    console.error("🔥 Error importing library variable:", error);
    return null;
  }
}

// --- Usage Example ---

async function main() {
  const myVariable = await getAndImportLibraryVariable(
    "Verizon Design System", 
    "[VDS] Surface",         
    "[VDS] color/surface"    
  );
  console.log("myVariable", myVariable)
  if (myVariable) {
    // --- NEW LOGIC START: Get Modes ---
    
    // 1. We must fetch the collection definition to see the modes
    const collection = await figma.variables.getVariableCollectionByIdAsync(myVariable.variableCollectionId);
    
    if (collection) {
      console.log(`\n🎨 Collection: "${collection.name}" has ${collection.modes.length} mode(s):`);
      console.log("---------------------------------------------------");
      
      // 2. Iterate and print all available modes
      collection.modes.forEach(mode => {
        console.log(`Mode Name: "${mode.name}" | ID: ${mode.modeId}`);
      });
      
      console.log("---------------------------------------------------\n");
    }
    // --- NEW LOGIC END ---

    // 3. Create a test rectangle
    const rect = figma.createRectangle();
    rect.name = "VDS Surface Rect";
    rect.resize(200, 200);

    // 4. Apply the imported variable
    rect.fills = [{
      type: 'SOLID',
      color: { r: 0.8, g: 0.8, b: 0.8 }, 
      boundVariables: {
        color: { type: 'VARIABLE_ALIAS', id: myVariable.id }
      }
    }];

    // 5. Find the mode you want (e.g., search for "Dark" or "High Contrast")
    // If you just want to test "any" other mode, you can pick by index: collection.modes[1]
    const targetModeName = "🌑 Dark - Brand Highlight"; // Change this string to match a real mode name from your logs
    const targetMode = collection.modes.find(m => m.name.includes(targetModeName)) || collection.modes[0];

    // 6. Apply the mode to the node (The "WHICH VERSION")
    if (targetMode) {
        console.log(`\n🌗 Switching node to mode: "${targetMode.name}"`);
        
        // This is the magic line:
        rect.setExplicitVariableModeForCollection(collection.id, targetMode.modeId);
    }
    
    figma.viewport.scrollAndZoomIntoView([rect]);
    figma.notify("Variable imported. Check console for modes.");
    
  } else {
    figma.notify("Could not find variable. Check console for details.");
  }
}

main();