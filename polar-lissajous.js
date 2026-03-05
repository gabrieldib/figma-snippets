// --- POLAR LISSAJOUS CURVE GENERATOR (CH. DE RIVIÈRE) ---

// ==========================================
// 🎛️ CONFIGURATION CONSTANTS
// ==========================================
const A = 300;                   // Maximum radius (overall size)
const P = 3;                     // Frequency of the radius pulse (p)
const Q = 7;                     // Frequency of the angle sweep (q)

// Applied from your mathematical snippet:
const THETA_MAX = Math.PI / 2;   // The amplitude of the angle sweep
const PHI = Math.PI / 2;         // Phase shift (varphi)

const RESOLUTION = 2000;         // Number of points (higher = smoother vector path)
const STROKE_COLOR = "#FF2A00";  // Vibrant red-orange
const STROKE_WEIGHT = 2;
// ==========================================

let pathData = "";

// The period for a closed curve with integer frequencies is 2*PI
const maxT = Math.PI * 2; 

// Generate the coordinates
for (let i = 0; i <= RESOLUTION; i++) {
  const t = (i / RESOLUTION) * maxT;
  
  // The exact formula from the snippet
  const r = A * Math.sin(P * t);
  const theta = THETA_MAX * Math.sin(Q * t + PHI);
  
  // Convert polar (r, theta) back to Cartesian (x, y) for drawing
  // Note: SVG Y-axis is inverted natively, but because this specific 
  // shape is perfectly symmetrical, it renders identically.
  const x = r * Math.cos(theta);
  const y = r * Math.sin(theta);
  
  // Build the SVG path string
  if (i === 0) {
    pathData += `M ${x} ${y} `;
  } else {
    pathData += `L ${x} ${y} `;
  }
}

// Wrap the path data in an SVG string 
const svgString = `<svg width="${A*2}" height="${A*2}" viewBox="${-A} ${-A} ${A*2} ${A*2}">
  <path d="${pathData}" stroke="${STROKE_COLOR}" stroke-width="${STROKE_WEIGHT}" fill="none" />
</svg>`;

// Create the vector node in Figma
const svgNode = figma.createNodeFromSvg(svgString);
svgNode.name = `Polar Lissajous (p=${P}, q=${Q}, phi=π/2)`;
svgNode.x = 0
svgNode.y = 0

// Focus the camera on the new curve
figma.currentPage.selection = [svgNode];
figma.viewport.scrollAndZoomIntoView([svgNode]);