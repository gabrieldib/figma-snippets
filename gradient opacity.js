sel = figma.currentPage.selection

sel[0].children.forEach( (e,i) => {
    e.opacity = (i+1)/100
})