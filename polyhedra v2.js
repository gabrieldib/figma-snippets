(async () => {
  // ==========================================
  // 1. CONFIGURATION
  // ==========================================
  const CONFIG = {
    shape: 'cuboctahedron', // 'tetrahedron', 'cube', 'octahedron', 'icosahedron'
    scale: 150,
    baseColor: { r: 0.2, g: 0.5, b: 0.9 }, // Your primary face color (0-1 range)
    rotation: {
      x: 32, // Degrees
      y: 135,  // Degrees
      z: 30   // Degrees
    }
  };

  // ==========================================
  // 2. EXPLICIT GEOMETRY (Vertices + Faces)
  // ==========================================
  const phi = (1 + Math.sqrt(5)) / 2;
  
  const shapes = {
    tetrahedron: {
      vertices: [[1,1,1], [-1,-1,1], [-1,1,-1], [1,-1,-1]],
      // Each array represents the vertex indices that make up one face
      faces: [[0,1,2], [0,2,3], [0,3,1], [1,3,2]]
    },
    cube: {
      vertices: [
        [-1,-1,-1], [1,-1,-1], [1,1,-1], [-1,1,-1],
        [-1,-1,1],  [1,-1,1],  [1,1,1],  [-1,1,1]
      ],
      faces: [
        [0,3,2,1], [4,5,6,7], [0,1,5,4], 
        [1,2,6,5], [2,3,7,6], [3,0,4,7]
      ]
    },
    octahedron: {
      vertices: [[1,0,0], [-1,0,0], [0,1,0], [0,-1,0], [0,0,1], [0,0,-1]],
      faces: [
        [0,2,4], [2,1,4], [1,3,4], [3,0,4],
        [0,3,5], [3,1,5], [1,2,5], [2,0,5]
      ]
    },
    icosahedron: {
      vertices: [
        [0,-1,-phi], [0,-1,phi], [0,1,-phi], [0,1,phi],
        [-1,-phi,0], [-1,phi,0], [1,-phi,0], [1,phi,0],
        [-phi,0,-1], [-phi,0,1], [phi,0,-1], [phi,0,1]
      ],
      faces: [
        [0,2,10], [0,10,6], [0,6,4], [0,4,8], [0,8,2],
        [3,1,11], [3,11,7], [3,7,5], [3,5,9], [3,9,1],
        [2,8,5], [8,4,9], [4,6,1], [6,10,11], [10,2,7],
        [2,5,7], [8,9,5], [4,1,9], [6,11,1], [10,7,11]
      ]
    },
    cuboctahedron: {
      vertices: [
        [1, 1, 0], [1, -1, 0], [-1, -1, 0], [-1, 1, 0],
        [1, 0, 1], [1, 0, -1], [-1, 0, 1], [-1, 0, -1],
        [0, 1, 1], [0, 1, -1], [0, -1, 1], [0, -1, -1]
      ],
      faces: [
        // 8 Triangular Faces
        [0, 8, 4], [0, 5, 9], [1, 4, 10], [1, 11, 5],
        [2, 10, 6], [2, 7, 11], [3, 6, 8], [3, 9, 7],
        // 6 Square Faces
        [0, 4, 1, 5], [2, 6, 3, 7], [8, 4, 10, 6],
        [9, 5, 11, 7], [0, 8, 3, 9], [1, 10, 2, 11]
      ]
    },
    dodecahedron: {
      vertices: [
        [-1, -1, -1], [1, -1, -1], [-1, 1, -1], [1, 1, -1],
        [-1, -1, 1],  [1, -1, 1],  [-1, 1, 1],  [1, 1, 1],
        [0, -1/phi, -phi], [0, 1/phi, -phi],
        [0, -1/phi, phi],  [0, 1/phi, phi],
        [-1/phi, -phi, 0], [1/phi, -phi, 0],
        [-1/phi, phi, 0],  [1/phi, phi, 0],
        [-phi, 0, -1/phi], [phi, 0, -1/phi],
        [-phi, 0, 1/phi],  [phi, 0, 1/phi]
      ],
      faces: [
        [3, 9, 2, 14, 15], [3, 15, 7, 19, 17],
        [3, 17, 1, 8, 9],  [2, 9, 8, 0, 16],
        [2, 16, 18, 6, 14], [14, 6, 11, 7, 15],
        [7, 11, 10, 5, 19], [5, 10, 4, 12, 13],
        [13, 1, 17, 19, 5], [1, 13, 12, 0, 8],
        [0, 12, 4, 18, 16], [4, 10, 11, 6, 18]
      ]
    }
  };

  const geometry = shapes[CONFIG.shape];
  if (!geometry) return console.error("Shape not found!");

  // Convert angles to radians
  const rad = (deg) => deg * (Math.PI / 180);
  const rx = rad(CONFIG.rotation.x);
  const ry = rad(CONFIG.rotation.y);
  const rz = rad(CONFIG.rotation.z);

  // 3D Rotation Math
  const rotate3D = (x, y, z) => {
    let y1 = y * Math.cos(rx) - z * Math.sin(rx);
    let z1 = y * Math.sin(rx) + z * Math.cos(rx);
    let x2 = x * Math.cos(ry) + z1 * Math.sin(ry);
    let z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);
    let x3 = x2 * Math.cos(rz) - y1 * Math.sin(rz);
    let y3 = x2 * Math.sin(rz) + y1 * Math.cos(rz);
    return { x: x3, y: y3, z: z2 };
  };

  // Interpolation helper for shading
  const interpolate = (start, end, factor) => start + (end - start) * factor;

  // ==========================================
  // 3. PROCESS AND SORT FACES (Painter's Algorithm)
  // ==========================================
  
  // First, rotate all vertices in 3D space
  const rotatedVertices = geometry.vertices.map(v => rotate3D(v[0], v[1], v[2]));

  // Next, map the explicit faces and calculate their average Z-depth
  const processedFaces = geometry.faces.map(faceIndices => {
    // Get the rotated 3D coordinates for this specific face
    const faceVerts = faceIndices.map(idx => rotatedVertices[idx]);
    
    // Calculate the average Z position of the face to determine its depth
    const avgZ = faceVerts.reduce((sum, v) => sum + v.z, 0) / faceVerts.length;

    return {
      indices: faceIndices,
      vertices3D: faceVerts,
      depth: avgZ
    };
  });

  // Sort faces from back to front (lowest Z to highest Z)
  processedFaces.sort((a, b) => a.depth - b.depth);

  // Find Min and Max Z for shading interpolation
  const minDepth = processedFaces[0].depth;
  const maxDepth = processedFaces[processedFaces.length - 1].depth;

  // ==========================================
  // 4. DRAW IN FIGMA
  // ==========================================
  const generatedNodes = [];

  processedFaces.forEach((face, index) => {
    // 1. Project to 2D
    const projected2D = face.vertices3D.map(v => ({
      x: v.x * CONFIG.scale,
      y: v.y * CONFIG.scale
    }));

    // 2. Setup Vector Network Data
    const segments = [];
    const loop = [];
    
    for (let i = 0; i < projected2D.length; i++) {
      // Connect each point to the next, and loop the last point back to 0
      segments.push({ start: i, end: (i + 1) % projected2D.length });
      loop.push(i);
    }

    // 3. Calculate Shading (Front is lighter, back is darker)
    // Avoid division by zero if min and max depth are identical
    const depthRange = maxDepth - minDepth === 0 ? 1 : maxDepth - minDepth;
    const depthFactor = (face.depth - minDepth) / depthRange; 
    
    // We blend the base color toward black for depth
    const shadowIntensity = 0.6; // Adjust this to make shadows darker/lighter
    const shadeFactor = interpolate(shadowIntensity, 1, depthFactor);

    const faceColor = {
      r: CONFIG.baseColor.r * shadeFactor,
      g: CONFIG.baseColor.g * shadeFactor,
      b: CONFIG.baseColor.b * shadeFactor
    };

    // 4. Create the Node
    const vectorNode = figma.createVector();
    vectorNode.name = `Face ${index + 1} (Depth: ${face.depth.toFixed(2)})`;
    
    vectorNode.vectorNetwork = {
      vertices: projected2D,
      segments: segments,
      regions: [{ windingRule: "NONZERO", loops: [loop] }]
    };

    // 5. Apply Styles
    vectorNode.fills = [{ type: 'SOLID', color: faceColor }];
    
    // Optional: Add a subtle stroke to define edges better
    vectorNode.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
    vectorNode.strokeWeight = 1;
    vectorNode.strokeAlign = 'CENTER';

    generatedNodes.push(vectorNode);
  });

  // Group all the individual faces into one tidy object
  const group = figma.group(generatedNodes, figma.currentPage);
  group.name = `${CONFIG.shape.toUpperCase()} (Rot: ${CONFIG.rotation.x}, ${CONFIG.rotation.y}, ${CONFIG.rotation.z})`;

  group.x = 0;
  group.y = 0;
  // figma.viewport.scrollAndZoomIntoView([group]);

  console.log(`Successfully generated a solid ${CONFIG.shape} with ${processedFaces.length} separate face nodes.`);
})();