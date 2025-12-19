/**
 * Recursively traverses a Figma node and collects 'characters' from all 
 * descendant TEXT nodes.
 * * @param {BaseNode} node - The current Figma node (or PageNode) to process.
 * @returns {string} The collected text from all TEXT nodes within the subtree.
 */
function capture_all_text(node) {
    let collected_text = "";

    // 1. Check if the current node is a TEXT node and collect its characters
    // The 'type' property is available on all BaseNode objects.
    if (node.type === 'TEXT') {
        // Add the text followed by a newline separator
        collected_text += node.characters + "\n";
    }

    // 2. Safely check if the node is a Container node (like a Frame, Page, Group, etc.)
    // Nodes that can contain children implement the 'children' property.
    // The 'children' property can be an empty array if the node is a container with no children.
    if ('children' in node) {
        // Iterate through all children and recursively call the function
        for (const child of node.children) {
            // Concatenate the text returned from the recursive call
            collected_text += capture_all_text(child);
        }
    }
    
    return collected_text;
}

// --- Execution ---

const component_name = 'Button';

// Use find() on the children array of the figma.root (which is the document node)
// This safely finds the PageNode.
const component_page = figma.root.children.find(page => page.name === component_name);

// Check if the page was found before attempting to traverse it
if (component_page) {
    const all_text = capture_all_text(component_page);
    console.log(all_text);
} else {
    console.error(`Page named "${component_name}" not found in the document.`);
}