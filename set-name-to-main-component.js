let sel = figma.currentPage.selection

sel.forEach( e => {
    e.name = e.mainComponent.name.toLowerCase().replaceAll(" ", "")
})