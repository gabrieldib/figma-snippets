clear()
const s = figma.currentPage.selection

let data = []

s.forEach( node => {
    data.push( node.name )
    
})

data.sort()

let all_names = ''

data.forEach( name => all_names += "\'"+name+"\',")

console.log(all_names)

