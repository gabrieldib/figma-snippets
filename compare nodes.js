console.clear()
// Function to get all properties of a node
function get_node_properties(node) {
    const result = {};
    for (const key in node) {
        try {
            result[key] = node[key];
        } catch (error) {
            result[key] = "Could not retrieve value";
        }
    }
    return result;
}

// Ensure exactly 2 nodes are selected
if (figma.currentPage.selection.length !== 2) {
    console.log("Please select exactly 2 nodes to compare their properties.");
} else {
    const [node1, node2] = figma.currentPage.selection;

    // Get properties of both nodes
    const props1 = get_node_properties(node1);
    const props2 = get_node_properties(node2);

    // Extract keys
    const keys1 = new Set(Object.keys(props1));
    const keys2 = new Set(Object.keys(props2));

    // Find common properties
    const commonProperties = [...keys1].filter(key => keys2.has(key));

    // Find properties only in the first node
    const onlyInNode1 = [...keys1].filter(key => !keys2.has(key));

    // Find properties only in the second node
    const onlyInNode2 = [...keys2].filter(key => !keys1.has(key));

    // Log the results
    console.log("Common Properties:", commonProperties);
    console.log(`Only in Node 1 ${node1.name}:`, onlyInNode1);
    console.log(`Only in Node 2 ${node2.name}:`, onlyInNode2);
}
