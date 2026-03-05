function log(...args) {
    args.forEach(arg => {
        console.log(arg);
    });
}

let sel = figma.currentPage.selection

const RUN = true

if (RUN) {
    sel.forEach( element => {
        log(element.name)
        let x = element.x
        let y = element.y
        element.x = Math.floor(element.x)
        element.y = Math.floor(element.y)
        log(x, element.x)
        log(y, element.y)
        
    })
}