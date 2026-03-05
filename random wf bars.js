let sel = figma.currentPage.selection[0]

let bar_heights = []

for (let i = 0; i < 200; i++) {
    let h = Math.floor(Math.random()*200)/2

    sel.children[i].resize(2, h)
    sel.children[i].y = (100-h)/2
}

 