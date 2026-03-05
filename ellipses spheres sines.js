// Configuration Constants
const NUM_LINES = 12;        // Number of parallel lines
const SPHERE_RADIUS = 200;   // The radius of our 3D sphere
const TILT_ANGLE = 25;       // Camera tilt in degrees

const tiltRads = TILT_ANGLE * (Math.PI / 180);

const centerX = SPHERE_RADIUS / 2;
const centerY = SPHERE_RADIUS / 2;

// The magic number to approximate a circle/ellipse with Bezier curves
const K = 0.552284749831; 

// We will build one massive SVG path string for the entire sphere
let fullSvgPath = "";

// Loop to calculate the path for each parallel line
for (let i = 0; i <= NUM_LINES; i++) {
    
    // 1. Calculate the latitude angle (theta)
    let theta = -Math.PI / 2 + (i / NUM_LINES) * Math.PI;

    // 2. Calculate 3D sphere properties at this latitude
    let sliceRadius = SPHERE_RADIUS * Math.cos(theta);
    let sliceY = SPHERE_RADIUS * Math.sin(theta);

    // 3. Project to 2D
    let rx = Math.max(0.01, sliceRadius);
    let ry = Math.max(0.01, sliceRadius * Math.sin(tiltRads));

    // 4. Calculate the center point for this specific ellipse
    let projectedY = sliceY * Math.cos(tiltRads);
    let cx = centerX;
    let cy = centerY - projectedY;

    // 5. Calculate the Bezier control point distances
    let ox = rx * K;
    let oy = ry * K;

    // 6. Construct the SVG path using Cubic Bezier (C) commands instead of Arcs
    let ellipsePath = 
        `M ${cx} ${cy - ry} ` + // Move to top
        `C ${cx + ox} ${cy - ry} ${cx + rx} ${cy - oy} ${cx + rx} ${cy} ` + // Curve to right
        `C ${cx + rx} ${cy + oy} ${cx + ox} ${cy + ry} ${cx} ${cy + ry} ` + // Curve to bottom
        `C ${cx - ox} ${cy + ry} ${cx - rx} ${cy + oy} ${cx - rx} ${cy} ` + // Curve to left
        `C ${cx - rx} ${cy - oy} ${cx - ox} ${cy - ry} ${cx} ${cy - ry} Z `; // Curve to top & close
    
    // Add this ellipse's path to our master string
    fullSvgPath += ellipsePath;
}

// 7. Create a single Vector node in Figma
const sphereVector = figma.createVector();

// 8. Apply our stitched SVG path data
sphereVector.vectorPaths = [{
    windingRule: 'EVENODD', 
    data: fullSvgPath.trim()
}];

// 9. Style the Vector
sphereVector.fills = [];
sphereVector.strokes = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
sphereVector.strokeWeight = 1;
sphereVector.name = "Wireframe Sphere (Bezier)";
sphereVector.x = 0;
sphereVector.y = 0;

// 10. Select the new vector and focus the camera on it
figma.currentPage.selection = [sphereVector];