/**
 * Recursively walks a plain JSON object and adds variable names
 * based on the provided variableMap.
 * @param {object | any[]} obj The plain object or array to traverse.
 * @param {Map<string, string>} variableMap A Map of VariableID -> VariableName.
 */
function enhanceNodeTreeWithVariables(obj, variableMap) {
  if (obj === null || typeof obj !== 'object') {
    return; // Base case: not an object or array
  }

  if (Array.isArray(obj)) {
    // If it's an array, recurse on each item
    obj.forEach(item => enhanceNodeTreeWithVariables(item, variableMap));
    return;
  }

  // --- This is the key logic ---
  // Check if this specific object is a variable alias
  if (obj.type === 'VARIABLE_ALIAS' && obj.id) {
    const varName = variableMap.get(obj.id);
    if (varName) {
      obj.name = varName; // Mutate the object to add the name
    }
  }
  // --- End logic ---

  // Recurse on all properties of the object
  // (This will find 'children', 'fills', 'boundVariables', etc.)
  for (const key in obj) {
    enhanceNodeTreeWithVariables(obj[key], variableMap);
  }
}

/**
 * Recursively serializes a Figma node and its children into a plain
 * JavaScript object.
 * @param {SceneNode} node The Figma node to serialize.
 * @returns {object} A plain object representing the node.
 */
function serializeNode(node) {
  // This is the plain object we will build
  const data = {};

  // --- 1. A list of common properties to copy ---
  const propertiesToCopy = [
    'id', 'name', 'type', 'width', 'height', 'x', 'y',
    'rotation', 'opacity', 'visible', 'locked',
    'blendMode', 'isMask', 'effects',
    'relativeTransform', 'absoluteBoundingBox'
  ];

  for (const prop of propertiesToCopy) {
    if (node[prop] !== undefined) {
      data[prop] = node[prop];
    }
  }

  // --- 2. Handle complex properties (like fills, strokes) ---
  const complexProperties = [
    'fills', 'strokes', 'strokeWeight', 'cornerRadius',
    'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'
  ];
  
  for (const prop of complexProperties) {
    if (node[prop] !== undefined) {
      if (node[prop] === figma.mixed) {
        data[prop] = 'MIXED';
      } else {
        // Deep-clone the object to make it plain
        data[prop] = JSON.parse(JSON.stringify(node[prop]));
      }
    }
  }

  // --- 3. Handle node-specific properties ---
  if (node.type === 'TEXT') {
    if (node.fontName === figma.mixed) {
      data.fontName = 'MIXED';
    } else {
      data.fontName = JSON.parse(JSON.stringify(node.fontName));
    }
    
    if (node.characters === figma.mixed) {
      data.characters = 'MIXED';
    } else {
      data.characters = node.characters;
    }
  }

  if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE') {
    data.layoutMode = node.layoutMode;
    data.itemSpacing = node.itemSpacing;
    data.counterAxisAlignItems = node.counterAxisAlignItems;
    data.primaryAxisAlignItems = node.primaryAxisAlignItems;
  }
  
  // --- 4. The Recursive Step: Handle Children ---
  if ('children' in node) {
    data.children = node.children.map(serializeNode); // No map needed here
  }

  return data;
}

// --- MAIN EXECUTION (Must be async) ---

(async () => {
  // 1. Get all local variables and create a lookup map
  const allVariables = await figma.variables.getLocalVariablesAsync();
  const variableMap = allVariables.reduce((map, variable) => {
    map.set(variable.id, variable.name);
    return map;
  }, new Map());

  // 2. Get the user's current selection
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.close("Please select a node first.");
  } else {
    // We'll just serialize the first selected node
    const selectedNode = selection[0];
    
    // 3. Call our original recursive serialization function
    const nodeTree = serializeNode(selectedNode);
    
    // 4. NEW: Call the enhancing function to add variable names
    enhanceNodeTreeWithVariables(nodeTree, variableMap);
    
    // 5. Convert the *enhanced* object to a JSON string
    const jsonOutput = JSON.stringify(nodeTree, null, 2);
    
    // 6. Log the result to the console
    console.log("--- Serialized Node Tree (with Variable Names) ---");
    console.log(jsonOutput);
    console.log("--------------------------------------------------");
    
  }
})();