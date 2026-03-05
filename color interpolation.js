(async () => {
  const interpolate = (start, end, factor) => start + (end - start) * factor;

  // 1. Get selection and convert to a mutable array
  let selection = [...figma.currentPage.selection];

  if (selection.length < 2) {
    console.error("Please select at least 2 nodes.");
    return;
  }

  // 2. Sort the selection array based on numbers found in the node names
  selection.sort((a, b) => {
    const numA = parseInt(a.name.match(/\d+/) || 0, 10);
    const numB = parseInt(b.name.match(/\d+/) || 0, 10);
    return numA - numB;
  });

  // 3. Grab colors from the newly sorted start and end nodes
  // Ensure the nodes actually have fills before accessing [0]
  const firstNodeFills = selection[0].fills;
  const lastNodeFills = selection[selection.length - 1].fills;

  if (!firstNodeFills.length || !lastNodeFills.length) {
    console.error("Start or end nodes must have a fill color.");
    return;
  }

  const startRgb = firstNodeFills[0].color;
  const endRgb = lastNodeFills[0].color;

  // 4. Interpolate
  selection.forEach((node, index) => {
    const factor = index / (selection.length - 1);

    const newFill = {
      type: 'SOLID',
      color: {
        r: interpolate(startRgb.r, endRgb.r, factor),
        g: interpolate(startRgb.g, endRgb.g, factor),
        b: interpolate(startRgb.b, endRgb.b, factor),
      }
    };

    if ("fills" in node) {
      node.fills = [newFill];
    }
  });

  console.log(`Interpolated ${selection.length} nodes based on name order.`);
})();