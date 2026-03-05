// Configuration Constants
const NUM_LINES = 37;        // The constant counter of lines (parallels)
const SPHERE_RADIUS = 200;   // The radius of our 3D sphere
const TILT_ANGLE = 25;       // Camera tilt in degrees (to see the ellipses)

// Convert tilt to radians for math
const tiltRads = TILT_ANGLE * (Math.PI / 180);

// Find the center of our current view to place the sphere
const centerX = figma.viewport.center.x;
const centerY = figma.viewport.center.y;

const ellipses = [];

// Loop to create each parallel line
for (let i = 0; i <= NUM_LINES; i++) {
    
    // 1. Calculate the latitude angle (theta)
    // We map our loop from the South Pole (-PI/2) to the North Pole (PI/2)
    let theta = -Math.PI / 2 + (i / NUM_LINES) * Math.PI;

    // 2. Calculate 3D sphere properties at this latitude
    // How wide is the sphere at this specific latitude?
    let sliceRadius = SPHERE_RADIUS * Math.cos(theta);
    
    // Where is this slice positioned on the 3D Y-axis?
    let sliceY = SPHERE_RADIUS * Math.sin(theta);

    // 3. Project to 2D using our tilt angle
    // The width of the ellipse stays exactly the same as the 3D radius
    let projectedWidth = sliceRadius * 2;
    
    // The height is compressed by the sine of our tilt angle
    let projectedHeight = (sliceRadius * Math.sin(tiltRads)) * 2;
    
    // The vertical center of the ellipse is shifted based on the tilt
    let projectedY = sliceY * Math.cos(tiltRads);

    // Figma throws an error if dimensions are exactly 0 (which happens at the poles)
    // We clamp the minimum size to 0.01 to prevent crashes.
    let finalWidth = Math.max(0.01, projectedWidth);
    let finalHeight = Math.max(0.01, projectedHeight);

    // 4. Create and position the ellipse in Figma
    const ellipse = figma.createEllipse();
    ellipse.resize(finalWidth, finalHeight);
    
    ellipse.x = centerX - (finalWidth / 2);
    // Subtract projectedY because Figma's Y-axis goes down, while standard math Y goes up
    ellipse.y = centerY - projectedY - (finalHeight / 2);

    // 5. Style the ellipse (Wireframe: No fill, solid stroke)
    ellipse.fills = [];
    ellipse.strokes = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
    ellipse.strokeWeight = 1;

    ellipses.push(ellipse);
}

// 6. Group them together for cleanliness
const sphereGroup = figma.group(ellipses, figma.currentPage);
sphereGroup.name = "Wireframe Sphere";
sphereGroup.x = 0;
sphereGroup.y = 0;

// Select the new group and focus the camera on it
figma.currentPage.selection = [sphereGroup];
// figma.viewport.scrollAndZoomIntoView([sphereGroup]);