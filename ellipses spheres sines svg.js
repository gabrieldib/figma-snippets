// Configuration Constants
const NUM_LINES = 20;        // Number of parallel lines
const SPHERE_RADIUS = 300;   // The radius of our 3D sphere
const TILT_ANGLE = 35;       // Camera tilt in degrees

// NEW: Rotation Variables (in degrees)
const ROTATION_Z = 0;       // Rolls the globe like a steering wheel (Z-axis)
const ROTATION_Y = 0;       // Spins the globe around its poles (Y-axis)

// New Wave Variables
const WAVE_FREQ = 2;         // How many "peaks" the wave has around the sphere
const WAVE_AMP = 0.5;        // Amplitude (height) of the wave in radians
const RESOLUTION = 300;      // How many line segments we use to draw each wave

const tiltRads = TILT_ANGLE * (Math.PI / 180);
const rotZRads = ROTATION_Z * (Math.PI / 180);
const rotYRads = ROTATION_Y * (Math.PI / 180);

const centerX = SPHERE_RADIUS / 2;
const centerY = SPHERE_RADIUS / 2;

let fullSvgPath = "";

// Loop to calculate the path for each wavy line
for (let i = 0; i <= NUM_LINES; i++) {
    
    // Calculate the base latitude angle for this specific parallel
    let thetaBase = -Math.PI / 2 + (i / NUM_LINES) * Math.PI;
    
    // We scale the amplitude by the cosine of the latitude.
    let currentAmp = WAVE_AMP * Math.cos(thetaBase);
    
    let pathString = "";
    
    // Loop around the 360 degrees (2*PI) of the sphere to plot points
    for (let j = 0; j <= RESOLUTION; j++) {
        
        // Longitude angle (t) from 0 to 2*PI
        let t = (j / RESOLUTION) * Math.PI * 2;
        
        // Modulate the latitude with our sine wave math
        let phi = thetaBase + currentAmp * Math.sin(WAVE_FREQ * t);
        
        // 1. Calculate the raw 3D Coordinates
        let x3d = SPHERE_RADIUS * Math.cos(phi) * Math.cos(t);
        let y3d = SPHERE_RADIUS * Math.sin(phi);
        let z3d = SPHERE_RADIUS * Math.cos(phi) * Math.sin(t);
        
        // 2. Apply Y-Axis Rotation (Spin)
        let xRotY = x3d * Math.cos(rotYRads) + z3d * Math.sin(rotYRads);
        let zRotY = -x3d * Math.sin(rotYRads) + z3d * Math.cos(rotYRads);
        let yRotY = y3d;

        // 3. Apply Z-Axis Rotation (Roll / Steering Wheel)
        let xRotZ = xRotY * Math.cos(rotZRads) - yRotY * Math.sin(rotZRads);
        let yRotZ = xRotY * Math.sin(rotZRads) + yRotY * Math.cos(rotZRads);
        let zRotZ = zRotY;
        
        // 4. Project 3D space into our 2D tilted camera view
        let x2d = centerX + xRotZ;
        let y2d = centerY - (yRotZ * Math.cos(tiltRads) - zRotZ * Math.sin(tiltRads));
        
        // 5. Construct the SVG path
        if (j === 0) {
            pathString += `M ${x2d} ${y2d} `;
        } else {
            pathString += `L ${x2d} ${y2d} `;
        }
    }
    
    // Close the loop for this specific line
    pathString += "Z ";
    fullSvgPath += pathString;
}

// Create a single Vector node in Figma
const sphereVector = figma.createVector();

// Apply our stitched SVG path data
sphereVector.vectorPaths = [{
    windingRule: 'EVENODD', 
    data: fullSvgPath.trim()
}];

// Style the Vector
sphereVector.fills = [];
sphereVector.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
sphereVector.strokeWeight = 1;
sphereVector.name = "Wave Wireframe Sphere (Rotated)";
sphereVector.x = 0;
sphereVector.y = 0;

if (figma.currentPage.selection.length > 0 && 
    figma.currentPage.selection[0].type === "VECTOR" &&
    figma.currentPage.selection[0].name.includes("Sphere")) {
      
    const child = figma.currentPage.selection[0];
    if ("strokes" in child) {
        strokes = [...child.strokes];
    }
    figma.currentPage.selection[0].remove();
}

// Select the new vector and focus the camera on it
figma.currentPage.selection = [sphereVector];