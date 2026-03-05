(() => {
  // ==========================================
  // CONFIGURATION CONSTANTS
  // ==========================================
  const NUM_ORBITS = 23;             // Total number of concentric circles
  const BASE_DISTANCE = 30;         // Base distance (in pixels) between each orbit's radius
  const JITTER_PERCENTAGE = 0.17;   // +/- percentage to randomize orbit radii (e.g., 0.15 = 15%)
  
  const MIN_PLANETS = 1;            // Minimum planets per orbit
  const MAX_PLANETS = 2;            // Maximum planets per orbit
  
  const MIN_PLANET_SIZE = 6;        // Minimum diameter of a planet
  const MAX_PLANET_SIZE = 20;       // Maximum diameter of a planet
  
  const STYLE_NAME = "Neutron";     // Name of your local style
  // ==========================================

  // 1. Setup Styles & Fallback
  const localPaintStyles = figma.getLocalPaintStyles();
  const neutronStyle = localPaintStyles.find(style => style.name === STYLE_NAME);

  // Hex #D9D9D9 converted to Figma's 0-1 RGB scale
  const fallbackPaint = [{
    type: 'SOLID',
    color: { r: 0xD9 / 255, g: 0xD9 / 255, b: 0xD9 / 255 }
  }];

  // Helpers for random math
  const randomInRange = (min, max) => Math.random() * (max - min) + min;
  const randomIntInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const generatedNodes = [];

  // 2. Main Generation Loop
  for (let i = 1; i <= NUM_ORBITS; i++) {
    
    // Calculate Orbit Radius with Jitter
    const baseRadius = i * BASE_DISTANCE;
    const jitterAmount = baseRadius * JITTER_PERCENTAGE;
    const jitter = randomInRange(-jitterAmount, jitterAmount);
    const orbitRadius = baseRadius + jitter;

    // Create Orbit Circle
    const orbit = figma.createEllipse();
    orbit.resize(orbitRadius * 2, orbitRadius * 2);
    // Center the orbit perfectly at 0,0
    orbit.x = -orbitRadius;
    orbit.y = -orbitRadius;
    orbit.name = `Orbit ${i}`;
    
    // Apply styling to Orbit
    orbit.fills = []; // No fill
    if (neutronStyle) {
      orbit.strokeStyleId = neutronStyle.id;
    } else {
      orbit.strokes = fallbackPaint;
    }
    orbit.strokeWeight = 1; // Default stroke weight
    
    generatedNodes.push(orbit);

    // 3. Create Planets for this Orbit
    const numPlanets = randomIntInRange(MIN_PLANETS, MAX_PLANETS);
    
    for (let p = 0; p < numPlanets; p++) {
      const planetDiameter = randomInRange(MIN_PLANET_SIZE, MAX_PLANET_SIZE);
      const planetRadius = planetDiameter / 2;
      
      // Random angle in radians (0 to 2π) for placement on the orbit path
      const angle = Math.random() * 2 * Math.PI;

      // Trigonometry to find exact center coordinates on the orbit path
      const cx = orbitRadius * Math.cos(angle);
      const cy = orbitRadius * Math.sin(angle);

      // Create Planet
      const planet = figma.createEllipse();
      planet.resize(planetDiameter, planetDiameter);
      // Offset by planet radius so the planet's *center* sits on the orbit
      planet.x = cx - planetRadius;
      planet.y = cy - planetRadius;
      planet.name = `Planet ${i}-${p + 1}`;

      // Apply styling to Planet
      planet.strokes = []; // No stroke
      if (neutronStyle) {
        planet.fillStyleId = neutronStyle.id;
      } else {
        planet.fills = fallbackPaint;
      }

      generatedNodes.push(planet);
    }
  }

  // 4. Group and Tidy Up
  const group = figma.group(generatedNodes, figma.currentPage);
  group.name = "Generated System";
  
  // Optional: Select the group and zoom into it so you can see it instantly
  figma.currentPage.selection = [group];
  // figma.viewport.scrollAndZoomIntoView([group]); 
  console.log(`Generated ${NUM_ORBITS} orbits and their planets successfully!`);
})();