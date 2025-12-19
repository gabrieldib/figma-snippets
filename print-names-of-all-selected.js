sel = figma.currentPage.selection

data = ''

sel.forEach(e => {
    data += e.name + "\n"
})

console.log(data)