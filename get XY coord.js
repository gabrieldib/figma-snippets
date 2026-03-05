console.clear()

function log(...args) {
    args.forEach(arg => {
        console.log(arg);
    });
}

function format_width(input, width, align = 'right') {
    let str = input.toString();
    if (align === 'right') {
        return str.padStart(width, ' ');
    } else if (align === 'left') {
        return str.padEnd(width, ' ');
    } else {
        throw new Error("Invalid alignment option. Use 'left' or 'right'.");
    }
}

let sel = figma.currentPage.selection

const RUN = true

let coordinates = ''

if (RUN) {
    sel.forEach( element => {
        element.x = Math.floor(element.x)
        element.y = Math.floor(element.y)
        coordinates += //format_width(element.name, 42, 'left') + 
            format_width(element.x, 4, 'right') + '\n' 
            //format_width(element.y, 4, 'right') +
            //"\n"
        
    })
}

console.log(coordinates)