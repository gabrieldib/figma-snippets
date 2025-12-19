sel = figma.currentPage.selection

sel.forEach(e => {
    console.log(e.name, e.id)
})