sel = figma.currentPage.selection

console.log("ID,X,Y,W,H")

sel[0].children.forEach((c) => {
    row = `${c.name},${c.x.toString()},${c.y.toString()},${c.width.toString()},${c.height.toString()}`
    console.log(row)
})

