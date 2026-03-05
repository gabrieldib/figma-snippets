const sel = figma.currentPage.selection

const h = sel[0].height
const step = h/sel.length

sel.forEach( (e, i) => {
    if (i < sel.length/2)
        e.resize(e.width, step * (i*2+1))
    else
        e.resize(e.width, step * ((sel.length-i*2)+1))
})