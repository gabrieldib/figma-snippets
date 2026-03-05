let sel = figma.currentPage.selection[0]

let bar_heights = []

for (let i = 0; i < 16; i++) {
    bar_heights.push(
        { y: sel.children[i].y, 
          h: sel.children[i].height,
          w: sel.children[i].width
        }
    )
    console.log(sel.children[i].name)
}

for (let i = 16; i < sel.children.length; i++) {
    console.log("processing bar", i, sel.children[i].name  )
    sel.children[i].y = bar_heights[ i % 16 ].y
    let h = bar_heights[ i % 16 ].h
    let w = bar_heights[ i % 16 ].w
    sel.children[i].resize(w, h)
    
}

