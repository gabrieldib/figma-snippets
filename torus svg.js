(() => {
  // ==========================================
  // 🍩 3D DONUT CONFIGURATION
  // Edit these values to change your donut!
  // ==========================================
  const config = {
    holeRadius: 90,         // Distance from the very center to the inner empty hole
    tubeRadius: 200,          // The thickness of the donut tube itself
    
    rotationX: 30,           // X-axis rotation (tilt up/down)
    rotationY: 30,           // Y-axis rotation (turn left/right)
    rotationZ: 0,          // Z-axis rotation (spin like a steering wheel)
    
    ringCount: 32,           // Number of wireframe circles to generate
    resolution: 100,          // How many points make up each circle (higher = smoother)
    
    orientation: "flat", // "vertical" (rings around the tube) or "flat" (topography slices)
    
    perspectiveDepth: 2500   // Camera distance (lower = more fish-eye distortion)
  };

  // ==========================================
  // MATH & GENERATION ENGINE
  // ==========================================
  
  // The Major Radius (R) is the distance to the center of the tube.
  const R = config.holeRadius + config.tubeRadius; 
  const r = config.tubeRadius;

  const degToRad = (deg) => deg * (Math.PI / 180);

  // Function to apply 3D rotation matrix
  const rotate3D = (x, y, z, pitch, yaw, roll) => {
    const cX = Math.cos(degToRad(pitch)), sX = Math.sin(degToRad(pitch));
    const cY = Math.cos(degToRad(yaw)),   sY = Math.sin(degToRad(yaw));
    const cZ = Math.cos(degToRad(roll)),  sZ = Math.sin(degToRad(roll));

    // X rotation
    let xy = cX * y - sX * z;
    let xz = sX * y + cX * z;
    y = xy; z = xz;

    // Y rotation
    let yx = cY * x + sY * z;
    let yz = -sY * x + cY * z;
    x = yx; z = yz;

    // Z rotation
    let zx = cZ * x - sZ * y;
    let zy = sZ * x + cZ * y;
    
    return { x: zx, y: zy, z };
  };

  let svgPaths = "";
  
  // Loop to generate each ring
  for (let i = 0; i < config.ringCount; i++) {
    let pathData = "";
    
    // Loop to generate the points along the current ring
    for (let j = 0; j <= config.resolution; j++) {
      let u, v;
      
      // Determine if rings wrap the tube (vertical) or slice the donut (flat)
      if (config.orientation === "vertical") {
        v = (i / config.ringCount) * Math.PI * 2; 
        u = (j / config.resolution) * Math.PI * 2; 
      } else {
        u = (i / config.ringCount) * Math.PI * 2; 
        v = (j / config.resolution) * Math.PI * 2; 
      }

      // Standard Torus Parametric Equation
      let x = (R + r * Math.cos(u)) * Math.cos(v);
      let y = (R + r * Math.cos(u)) * Math.sin(v);
      let z = r * Math.sin(u);

      let rotated = rotate3D(x, y, z, config.rotationX, config.rotationY, config.rotationZ);

      // Perspective Projection
      // Objects closer to the "camera" appear larger, creating true 3D depth
      const zOffset = config.perspectiveDepth;
      const safeZ = Math.max(rotated.z, -zOffset + 1); // Prevent math blowing up
      const perspectiveFactor = zOffset / (zOffset - safeZ);

      const projX = rotated.x * perspectiveFactor;
      // We flip Y (-rotated.y) because standard 3D math goes UP, but Figma coordinates go DOWN
      const projY = -rotated.y * perspectiveFactor; 

      // Draw the SVG line segment
      if (j === 0) {
        pathData += `M ${projX.toFixed(2)} ${projY.toFixed(2)} `;
      } else {
        pathData += `L ${projX.toFixed(2)} ${projY.toFixed(2)} `;
      }
    }
    pathData += "Z"; // Close the loop seamlessly
    
    // Add standard white stroke path
    svgPaths += `<path d="${pathData}" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-linejoin="round" />\n`;
  }

  // Wrap inside an SVG container with plenty of breathing room
  const svgString = `
    <svg width="2000" height="2000" viewBox="-1000 -1000 2000 2000" xmlns="http://www.w3.org/2000/svg">
      ${svgPaths}
    </svg>
  `;

  // ==========================================
  // RENDER IN FIGMA
  // ==========================================
  
  const donutNode = figma.createNodeFromSvg(svgString);
  donutNode.name = `3D Wireframe Donut (${config.orientation})`;
  
  // Give it a dark charcoal background so the white lines pop instantly
  donutNode.fills = [{ type: 'SOLID', color: { r: 0.08, g: 0.08, b: 0.09 } }];
  donutNode.cornerRadius = 32;
  
  // Plop it right in the center of your current view
  donutNode.x = figma.viewport.center.x - donutNode.width / 2;
  donutNode.y = figma.viewport.center.y - donutNode.height / 2;
  
  figma.currentPage.appendChild(donutNode);
  // figma.viewport.scrollAndZoomIntoView([donutNode]);

  console.log("🍩 3D wireframe donut generated successfully!");
})();