(async() => {
    const rgbToHex = (r, g, b) => {
      const toHex = (value) => {
        // 1. Scale 0-1 to 0-255
        // 2. Round to nearest integer
        // 3. Convert to Hex string
        // 4. Pad with a leading zero if it's a single digit
        const hex = Math.round(value * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      };
    
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
    };
    
    async function rename_color_box(sel) {
    const fill_color = sel.fills[0].color
    const title = sel.children[0]
    const color_hex = sel.children[1]

    const current_font = {fontName: title.fontName, fontSize: title.fontSize}
  
    // Define the font you want to load
    const fontToLoad = { 
      family: current_font.fontName.family, 
      style: current_font.fontName.style 
    };

    // Load the font asynchronously
    await figma.loadFontAsync(fontToLoad);

    title.fontName = current_font.fontName
    title.fontSize = current_font.fontSize
    color_hex.fontName = current_font.fontName
    color_hex.fontSize = current_font.fontSize

    const r = fill_color.r
    const g = fill_color.g
    const b = fill_color.b
    color_hex.characters = rgbToHex(r,g,b)
}

    const selection = figma.currentPage.selection
    selection.forEach( sel => {
        rename_color_box(sel);    
    })
        
})();


