// --- SYNTHESIS 241° SPHERE GENERATOR (MODULAR) ---

// ==========================================
// 🎛️ CONFIGURATION CONSTANTS
// ==========================================
const DRAW_MERIDIANS = true;     // Set to false to hide vertical lines
const DRAW_PARALLELS = true;     // Set to false to hide horizontal lines

const NUM_MERIDIANS = 0;        // Number of vertical slices (longitude)
const NUM_PARALLELS = 75;        // Number of horizontal slices (latitude)

const RADIUS = 300;              // Base radius of the 3D sphere
const PERSPECTIVE_TILT_DEG = 35; // Top-down viewing angle (0 = flat edge-on, 90 = top-down)
const OVERALL_ROTATION_DEG = 0;// Final rotation of the entire grouped object

// Styling
const STROKE_COLOR = { r: 1.0, g: 0.27, b: 0.13 }; // Red-orange (RGB values 0 to 1)
const STROKE_WEIGHT = 2;
const OPACITY = 0.85;
// ==========================================

const D = RADIUS * 2;
const center = figma.viewport.center;
const nodes = [];

// Helper: Convert degrees to radians for the math functions
const degToRad = (deg) => (deg * Math.PI) / 180;
const perspectiveTilt = degToRad(PERSPECTIVE_TILT_DEG);

// Helper: Draw and style each 2D ellipse
function createWireframeEllipse(width, height, x, y) {
  // Figma requires dimensions to be strictly > 0 to avoid crashing
  const w = Math.max(0.01, Math.abs(width));
  const h = Math.max(0.01, Math.abs(height));

  const ellipse = figma.createEllipse();
  ellipse.resize(w, h);
  
  ellipse.x = x - w / 2;
  ellipse.y = y - h / 2;
  
  ellipse.fills = [];
  ellipse.strokes = [{ type: 'SOLID', color: STROKE_COLOR }];
  ellipse.strokeWeight = STROKE_WEIGHT;
  ellipse.opacity = OPACITY;

  return ellipse;
}

// 1. GENERATE VERTICAL LINES (Meridians)
if (DRAW_MERIDIANS) {
  for (let i = 0; i < NUM_MERIDIANS; i++) {
    const angle = (i / NUM_MERIDIANS) * Math.PI;
    const w = D * Math.cos(angle);
    
    // Meridians span the full height of the sphere
    const ellipse = createWireframeEllipse(w, D, center.x, center.y);
    nodes.push(ellipse);
  }
}

// 2. GENERATE HORIZONTAL LINES (Parallels)
if (DRAW_PARALLELS) {
  for (let i = 1; i < NUM_PARALLELS; i++) {
    const angle = -Math.PI / 2 + (i / NUM_PARALLELS) * Math.PI;

    const sliceRadius = RADIUS * Math.cos(angle);
    const w = sliceRadius * 2;
    const h = w * Math.sin(perspectiveTilt);
    const yOffset = RADIUS * Math.sin(angle) * Math.cos(perspectiveTilt);

    const ellipse = createWireframeEllipse(w, h, center.x, center.y - yOffset);
    nodes.push(ellipse);
  }
}

// 3. GROUP AND ROTATE
if (nodes.length > 0) {
  const group = figma.group(nodes, figma.currentPage);
  group.name = `Synthesis 241° (${NUM_MERIDIANS}x${NUM_PARALLELS})`;
  
  // Apply the final dynamic tilt to the whole grouping
  group.rotation = OVERALL_ROTATION_DEG;

  // Frame the camera on the newly generated artwork
  figma.currentPage.selection = [group];
  figma.viewport.scrollAndZoomIntoView([group]);
} else {
  console.warn("Both DRAW_MERIDIANS and DRAW_PARALLELS are set to false. Nothing to draw!");
}