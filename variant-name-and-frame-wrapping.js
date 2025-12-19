let sel = figma.currentPage.selection

sel.forEach( e => {
    e.name = e.mainComponent.name.toLowerCase().replaceAll(" ", "")
    const f = figma.createFrame()
    f.x=e.x
    f.y=e.y
    f.resize(e.width, e.height)
    const f_fill = [{
        "type": "SOLID",
        "visible": true,
        "opacity": 1,
        "blendMode": "NORMAL",
        "color": {
            "r": 1,
            "g": 1,
            "b": 1
        },
        "boundVariables": {}
    }]
    f.fills=f_fill
    f.name=e.name
    f.appendChild(e)
    e.x=0
    e.y=0
    f.expanded=false
})
