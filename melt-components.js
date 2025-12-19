/*
work in progress:
This script is supposed to be used to detach and ungroup a component to its base layers,
while removing duplicate instances from the same component set (variants).
*/

const FIGMA_FILE_KEY = '';
const FIGMA_TOKEN = '';

const sel = figma.currentPage.selection;

// 1. Recursive function to ungroup and collect all leaf nodes
function break_apart(node) {
    let leafNodes = [];

    // If it's a Frame or Group, ungroup and recurse
    if (node.type === 'FRAME' || node.type === 'GROUP') {
        const children = figma.ungroup(node);
        for (const child of children) {
            leafNodes = leafNodes.concat(break_apart(child));
        }
    } 
    // If it's a leaf node (Text, Vector, Instance, etc.), keep it
    else {
        leafNodes.push(node);
    }
    return leafNodes;
}

// 2. Function to remove duplicates from the same Component Set
function deduplicate_instances(nodes) {
    const uniqueNodes = [];
    const seenSourceIds = new Set(); // We will store IDs of Component Sets we've already seen

    for (const node of nodes) {
        
        // We only check for duplicates if the node is an Instance
        if (node.type === 'INSTANCE') {
            
            const mainComponent = node.mainComponent;
            let sourceId = null;

            if (mainComponent) {
                // CHECK: Is this component part of a Component Set (Variants)?
                // We use optional chaining (?.) to safely check parent types
                if (mainComponent.parent?.type === 'COMPONENT_SET') {
                    // Use the ID of the Component Set as the unique key
                    // This treats all Variants (Primary, Secondary, Hover) as the "Same" object
                    sourceId = mainComponent.parent.id;
                } else {
                    // If it's not in a Set (standalone component), use its own ID
                    sourceId = mainComponent.id;
                }
            }

            // DECISION: Have we seen this source before?
            if (sourceId && seenSourceIds.has(sourceId)) {
                // Case A: Duplicate found. Remove it from the canvas.
                node.remove(); 
                // We do NOT add it to uniqueNodes
            } else {
                // Case B: First time seeing this source. Keep it.
                if (sourceId) seenSourceIds.add(sourceId);
                uniqueNodes.push(node);
            }
        } 
        else {
            // Non-instances (Text, Rectangles) are always kept
            uniqueNodes.push(node);
        }
    }
    return uniqueNodes;
}

// --- Main Execution ---

if (sel.length === 1) {
    let rootNode = sel[0];

    // Detach the top-level instance if necessary
    if (rootNode.type === 'INSTANCE') {
        rootNode = rootNode.detachInstance();
    }

    // 1. Explode the node into a flat list of layers
    const rawLayers = break_apart(rootNode);

    // 2. Filter out duplicates from the same component set
    const finalLayers = deduplicate_instances(rawLayers);

    // 3. Select the result
    console.log(`Finished. Kept ${finalLayers.length} unique items.`);
    figma.currentPage.selection = finalLayers;

} else { 
    console.log("Please select exactly one node.");
}