let sel = figma.currentPage.selection

sel.forEach( e => {
    e.layoutMode = "VERTICAL"
    e.layoutSizingHorizontal = "HUG";
    e.layoutSizingVertical = "HUG";
    e.primaryAxisAlignItems = "CENTER"
    e.paddingLeft   = 20;
    e.paddingTop    = 20;
    e.paddingRight  = 20;
    e.paddingBottom = 20;
    
})