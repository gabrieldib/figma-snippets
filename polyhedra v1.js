(async () => {
  // ==========================================
  // 1. CONFIGURATION
  // ==========================================
  // Available Shapes: 'tetrahedron', 'cube', 'octahedron', 
  // 'icosahedron', 'dodecahedron', 'cuboctahedron', 'rhombicDodecahedron'
  const CONFIG = {
    shape: 'dodecahedron', 
    scale: 200,           
    rotation: {
      x: 20, // Degrees
      y: 45, // Degrees
      z: 30  // Degrees
    }
  };

  // ==========================================
  // 2. MATH & GEOMETRY UTILS
  // ==========================================
  const phi = (1 + Math.sqrt(5)) / 2; // The Golden Ratio
  const invPhi = 1 / phi;

  // Vertex dictionaries
  const shapes = {
    tetrahedron: [
      [1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]
    ],
    cube: [
      [-1,-1,-1], [1,-1,-1], [-1,1,-1], [1,1,-1],
      [-1,-1,1],  [1,-1,1],  [-1,1,1],  [1,1,1]
    ],
    octahedron: [
      [1,0,0], [-1,0,0], [0,1,0], [0,-1,0], [0,0,1], [0,0,-1]
    ],
    // The 20-sided die
    icosahedron: [
      [0, -1, -phi], [0, -1, phi], [0, 1, -phi], [0, 1, phi],
      [-1, -phi, 0], [-1, phi, 0], [1, -phi, 0], [1, phi, 0],
      [-phi, 0, -1], [-phi, 0, 1], [phi, 0, -1], [phi, 0, 1]
    ],
    // The 12-sided pentagonal solid
    dodecahedron: [
      [-1,-1,-1], [1,-1,-1], [-1,1,-1], [1,1,-1],
      [-1,-1,1],  [1,-1,1],  [-1,1,1],  [1,1,1],
      [0, -invPhi, -phi], [0, -invPhi, phi], [0, invPhi, -phi], [0, invPhi, phi],
      [-invPhi, -phi, 0], [-invPhi, phi, 0], [invPhi, -phi, 0], [invPhi, phi, 0],
      [-phi, 0, -invPhi], [-phi, 0, invPhi], [phi, 0, -invPhi], [phi, 0, invPhi]
    ],
    // Uncommon 1: Archimedean solid (14 faces)
    cuboctahedron: [
      [1,1,0], [1,-1,0], [-1,1,0], [-1,-1,0],
      [1,0,1], [1,0,-1], [-1,0,1], [-1,0,-1],
      [0,1,1], [0,1,-1], [0,-1,1], [0,-1,-1]
    ],
    // Uncommon 2: Catalan solid (12 rhombic faces)
    rhombicDodecahedron: [
      [-1,-1,-1], [1,-1,-1], [-1,1,-1], [1,1,-1],
      [-1,-1,1],  [1,-1,1],  [-1,1,1],  [1,1,1],
      [2,0,0], [-2,0,0], [0,2,0], [0,-2,0], [0,0,2], [0,0,-2]
    ]
  };

  const vertices3D = shapes[CONFIG.shape];
  if (!vertices3D) return console.error("Shape not found!");

  // Convert degrees to radians
  const rad = (deg) => deg * (Math.PI / 180);
  const rx = rad(CONFIG.rotation.x);
  const ry = rad(CONFIG.rotation.y);
  const rz = rad(CONFIG.rotation.z);

  // 3D Rotation Function
  const rotate3D = (x, y, z) => {
    // Rotate X
    let y1 = y * Math.cos(rx) - z * Math.sin(rx);
    let z1 = y * Math.sin(rx) + z * Math.cos(rx);
    // Rotate Y
    let x2 = x * Math.cos(ry) + z1 * Math.sin(ry);
    let z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);
    // Rotate Z
    let x3 = x2 * Math.cos(rz) - y1 * Math.sin(rz);
    let y3 = x2 * Math.sin(rz) + y1 * Math.cos(rz);
    
    return { x: x3, y: y3, z: z2 };
  };

  // ==========================================
  // 3. GENERATE GEOMETRY
  // ==========================================
  
  // Apply rotation and scaling to get our final 2D projection points
  const projectedVertices = vertices3D.map(v => {
    const rotated = rotate3D(v[0], v[1], v[2]);
    // Orthographic projection: just drop the Z axis and scale X/Y
    return {
      x: rotated.x * CONFIG.scale,
      y: rotated.y * CONFIG.scale
    };
  });

  // Automatically find edges based on the shortest 3D distance
  const segments = [];
  let minDistance = Infinity;
  const distances = [];

  // Calculate all possible distances
  for (let i = 0; i < vertices3D.length; i++) {
    for (let j = i + 1; j < vertices3D.length; j++) {
      const v1 = vertices3D[i];
      const v2 = vertices3D[j];
      const dist = Math.sqrt(
        Math.pow(v2[0] - v1[0], 2) + 
        Math.pow(v2[1] - v1[1], 2) + 
        Math.pow(v2[2] - v1[2], 2)
      );
      distances.push({ start: i, end: j, dist });
      if (dist < minDistance && dist > 0.1) {
        minDistance = dist;
      }
    }
  }

  // Filter pairs that match the minimum distance (plus a tiny margin for float math)
  distances.forEach(d => {
    if (Math.abs(d.dist - minDistance) < 0.01) {
      segments.push({ start: d.start, end: d.end });
    }
  });

  // ==========================================
  // 4. DRAW IN FIGMA
  // ==========================================
  const vector = figma.createVector();
  vector.name = `${CONFIG.shape.toUpperCase()} (Rot: ${CONFIG.rotation.x}, ${CONFIG.rotation.y}, ${CONFIG.rotation.z})`;
  
  vector.vectorNetwork = {
    vertices: projectedVertices,
    segments: segments
  };

  // Styling the wireframe
  vector.strokes = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
  vector.strokeWeight = 2;
  vector.strokeLineCap = 'ROUND';
  vector.strokeLineJoin = 'ROUND';

  figma.currentPage.appendChild(vector);
  vector.x = 0;
  vector.y = 0;
  // figma.viewport.scrollAndZoomIntoView([vector]);

  console.log(`Successfully generated ${CONFIG.shape} with ${projectedVertices.length} vertices and ${segments.length} edges.`);
})();