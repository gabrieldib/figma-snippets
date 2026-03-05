const createStylesFromSelection = () => {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    console.error("No nodes selected.");
    return;
  }

  selection.forEach((node, index) => {
    // 1. Check if the node has fills and at least one paint
    if ("fills" in node && node.fills.length > 0) {
      const firstFill = node.fills[0];

      // 2. Ensure the fill is a SOLID color (gradients/images don't have a single .color)
      if (firstFill.type === 'SOLID') {
        const { r, g, b } = firstFill.color;

        // 3. Create the Style
        const newStyle = figma.createPaintStyle();
        
        // Default name using index (since you'll handle names later)
        newStyle.name = `Via Sonica / Greys / Grey ${node.name}`;

        // 4. Assign the color via a Paint object
        newStyle.paints = [{
          type: 'SOLID',
          color: { r, g, b },
          opacity: firstFill.opacity ?? 1 // Optional: preserves the node's fill opacity
        }];

        // 5. Link the node to the new style (Optional but recommended)
        // This makes the node actually use the style you just created
        node.fillStyleId = newStyle.id;
      }
    }
  });

  console.log(`Created ${selection.length} styles.`);
};

createStylesFromSelection();