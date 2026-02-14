// --- GLOWING POLAR LISSAJOUS GENERATOR ---

// ==========================================
// 🎛️ CONFIGURATION CONSTANTS
// ==========================================
const A = 300;                   // Maximum radius
const P = 3;                     // Frequency p
const Q = 7;                     // Frequency q
const THETA_MAX = Math.PI / 2;   // Angle sweep amplitude
const PHI = Math.PI / 2;         // Phase shift

const RESOLUTION = 2500;         // Slight bump in resolution for smoother thick lines
const STROKE_COLOR = "#FF3F14";  // A slightly punchier red-orange for light effects

// 🌟 LAYER CONFIGURATION (Rendered back to front)
// Adjust weights and opacities to tune the glow intensity.
const layersConfig = [
  { weight: 24, opacity: 0.15, name: "Outer Bloom" }, // Very thick, very faint
  { weight: 8,  opacity: 0.4,  name: "Mid Glow" },    // Medium thick, medium brightness
  { weight: 2,  opacity: 1.0,  name: "Core Beam" }    // Thin, intensely bright core
];
// ==========================================

let pathData = "";
const maxT = Math.PI * 2; 

// 1. CALCULATE THE GEOMETRY ONCE
// We calculate the path data only one time, as the shape is identical for all layers.
for (let i = 0; i <= RESOLUTION; i++) {
  const t = (i / RESOLUTION) * maxT;
  
  const r = A * Math.sin(P * t);
  const theta = THETA_MAX * Math.sin(Q * t + PHI);
  
  // Invert Y here to align nicely with Figma's coordinate system,
  // though for this symmetrical shape it doesn't strictly matter.
  const x = r * Math.cos(theta);
  const y = -r * Math.sin(theta); 
  
  if (i === 0) {
    pathData += `M ${x} ${y} `;
  } else {
    pathData += `L ${x} ${y} `;
  }
}

const generatedNodes = [];

// 2. GENERATE LAYERED SVGs
// Iterate through our config array to create the stack of glowing paths.
for (const config of layersConfig) {
  // We embed opacity directly into the SVG stroke style
  const svgString = `<svg width="${A*2}" height="${A*2}" viewBox="${-A} ${-A} ${A*2} ${A*2}">
    <path d="${pathData}" stroke="${STROKE_COLOR}" stroke-width="${config.weight}" stroke-opacity="${config.opacity}" stroke-linecap="round" fill="none" />
  </svg>`;

  const svgNode = figma.createNodeFromSvg(svgString);
  svgNode.name = config.name;
  
  // Center the node
  svgNode.x = figma.viewport.center.x - A;
  svgNode.y = figma.viewport.center.y - A;
  
  // 💡 CRITICAL for the glow effect:
  // Set blend mode to SCREEN so the layers add light to each other
  // against a dark background.
  svgNode.blendMode = "SCREEN";

  generatedNodes.push(svgNode);
}

// 3. GROUP EVERYTHING
const group = figma.group(generatedNodes, figma.currentPage);
group.name = `Glowing Lissajous (p=${P}, q=${Q})`;

// Focus camera
figma.currentPage.selection = [group];
figma.viewport.scrollAndZoomIntoView([group]);