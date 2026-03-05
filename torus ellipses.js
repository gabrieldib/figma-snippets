(() => {
  // ==========================================
  // 🍩 3D DONUT CONFIGURATION
  // ==========================================
  const config = {
    holeRadius: 120,         
    tubeRadius: 60,          
    
    rotationX: 65,           // X-axis tilt
    rotationY: -25,          // Y-axis turn
    rotationZ: -15,          // Z-axis spin
    
    ringCount: 48,           // Number of wireframe rings
    
    // Choose: "vertical" (tube wrapping) or "flat" (topography slices)
    orientation: "vertical"  
  };

  // ==========================================
  // MATH & 3D ROTATION ENGINE
  // ==========================================
  const R = config.holeRadius + config.tubeRadius; 
  const r = config.tubeRadius;
  const degToRad = (deg) => deg * (Math.PI / 180);

  const rotate3D = (x, y, z, pitch, yaw, roll) => {
    const cX = Math.cos(degToRad(pitch)), sX = Math.sin(degToRad(pitch));
    const cY = Math.cos(degToRad(yaw)),   sY = Math.sin(degToRad(yaw));
    const cZ = Math.cos(degToRad(roll)),  sZ = Math.sin(degToRad(roll));

    let xy = cX * y - sX * z, xz = sX * y + cX * z; y = xy; z = xz;
    let yx = cY * x + sY * z, yz = -sY * x + cY * z; x = yx; z = yz;
    let zx = cZ * x - sZ * y, zy = sZ * x + cZ * y;
    
    return { x: zx, y: zy, z };
  };

  const ringsData = [];

  for (let i = 0; i < config.ringCount; i++) {
    const angle = (i / config.ringCount) * Math.PI * 2;
    let C, U, V;

    if (config.orientation === "vertical") {
      C = { x: R * Math.cos(angle), y: R * Math.sin(angle), z: 0 };
      U = { x: 0, y: 0, z: r }; 
      V = { x: r * Math.cos(angle), y: r * Math.sin(angle), z: 0 }; 
    } else {
      const currentRadius = R + r * Math.cos(angle);
      C = { x: 0, y: 0, z: r * Math.sin(angle) };
      U = { x: currentRadius, y: 0, z: 0 };
      V = { x: 0, y: currentRadius, z: 0 };
    }

    const rotC = rotate3D(C.x, C.y, C.z, config.rotationX, config.rotationY, config.rotationZ);
    const rotU = rotate3D(U.x, U.y, U.z, config.rotationX, config.rotationY, config.rotationZ);
    const rotV = rotate3D(V.x, V.y, V.z, config.rotationX, config.rotationY, config.rotationZ);

    ringsData.push({ rotC, rotU, rotV });
  }

  // Sort by Z-depth to ensure proper drawing order
  ringsData.sort((a, b) => a.rotC.z - b.rotC.z);

  // ==========================================
  // RENDER NATIVE FIGMA NODES (SHEAR-FREE)
  // ==========================================
  const frameSize = (R + r) * 3; 
  const donutFrame = figma.createFrame();
  donutFrame.name = `3D Native Donut (${config.orientation})`;
  donutFrame.resize(frameSize, frameSize);
  donutFrame.fills = [{ type: 'SOLID', color: { r: 0.08, g: 0.08, b: 0.09 } }];
  donutFrame.cornerRadius = 32;

  const centerOffset = frameSize / 2;

  ringsData.forEach((ring, index) => {
    const { rotC, rotU, rotV } = ring;

    // 1. Extract 2D projected vectors (Note: Figma Y points down, so we invert Y)
    const ux = rotU.x, uy = -rotU.y;
    const vx = rotV.x, vy = -rotV.y;

    // 2. Eigenvalue math to find true orthogonal Major/Minor axes
    const E = ux * ux + vx * vx;
    const G = uy * uy + vy * vy;
    const F = ux * uy + vx * vy;

    const mean = (E + G) / 2;
    const diff = (E - G) / 2;
    const rad = Math.sqrt(diff * diff + F * F);

    const semiMajor = Math.sqrt(Math.max(0, mean + rad));
    const semiMinor = Math.sqrt(Math.max(0, mean - rad));

    let theta = 0;
    if (rad > 0.0001) {
      theta = 0.5 * Math.atan2(2 * F, E - G);
    }

    // 3. Build a pure (no-shear) affine transformation matrix for Figma
    const m00 = semiMajor * Math.cos(theta);
    const m10 = -semiMajor * Math.sin(theta); 
    const m01 = -semiMinor * Math.sin(theta);
    const m11 = -semiMinor * Math.cos(theta);

    const cx = rotC.x + centerOffset;
    const cy = -rotC.y + centerOffset;

    // We subtract m00 and m01 because local center of a 2x2 ellipse is at (1,1)
    const tx = cx - m00 - m01;
    const ty = cy - m10 - m11;

    // 4. Create the native Figma Ellipse
    const ellipse = figma.createEllipse();
    ellipse.resize(2, 2); 
    
    ellipse.fills = [];
    ellipse.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    ellipse.strokeWeight = 1.5;
    
    // Fade the rings further back in 3D space
    ellipse.opacity = 0.15 + 0.85 * (index / ringsData.length);

    // Apply the mathematically perfect, shear-free matrix
    ellipse.relativeTransform = [
      [m00, m01, tx],
      [m10, m11, ty]
    ];

    donutFrame.appendChild(ellipse);
  });

  // Position it in your view
  donutFrame.x = figma.viewport.center.x - donutFrame.width / 2;
  donutFrame.y = figma.viewport.center.y - donutFrame.height / 2;
  
  figma.currentPage.appendChild(donutFrame);
  figma.viewport.scrollAndZoomIntoView([donutFrame]);

  console.log("🍩 Native Figma node donut generated successfully!");
})();