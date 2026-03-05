function rotate_around_center(node, angleDegrees) {
  // 1. Convert to radians. 
  // In Figma's Y-down coordinate space, a positive angle visually rotates CLOCKWISE.
  const theta = angleDegrees * (Math.PI / 180);
  
  // 2. Extract the current transformation matrix components
  const [[a, b, tx], [c, d, ty]] = node.relativeTransform;

  // 3. Find the exact visual center in parent coordinates.
  // node.width and node.height are the unrotated bounds, which makes this highly accurate.
  const cx = a * (node.width / 2) + b * (node.height / 2) + tx;
  const cy = c * (node.width / 2) + d * (node.height / 2) + ty;

  // 4. Precompute rotation sine and cosine
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);

  // 5. Calculate the translation needed to keep the center pinned in place
  const rotTx = cx - (cx * cos) + (cy * sin);
  const rotTy = cy - (cx * sin) - (cy * cos);

  // 6. Multiply the new rotation matrix by the current matrix
  const newA = cos * a - sin * c;
  const newB = cos * b - sin * d;
  const newTx = cos * tx - sin * ty + rotTx;

  const newC = sin * a + cos * c;
  const newD = sin * b + cos * d;
  const newTy = sin * tx + cos * ty + rotTy;

  // 7. Return the final affine transformation matrix
  return [
    [newA, newB, newTx],
    [newC, newD, newTy]
  ];
}

const sel = figma.currentPage.selection

sel.forEach( e => {
    e.relativeTransform = rotate_around_center(e, 180)
})