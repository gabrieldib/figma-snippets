function log(...args) {
    args.forEach(arg => {
        console.log(arg);
    });
}

let sel = figma.currentPage.selection

const RUN = true

let x_coord = []

if (RUN) {
    sel.forEach( node => {
        x_coord.push(node.x)
    })
}

console.log(x_coord.join('\n'))