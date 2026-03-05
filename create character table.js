console.clear()

let mt = figma.createText()

await figma.loadFontAsync({ family: mt.fontName.family, style: mt.fontName.style })

let char_table = []

for (let i = 0; i < 256; i++ ){
    char_table.push(String.fromCharCode(i))
}

console.log(char_table)

for (const char in char_table) {
    mt.characters += char_table[char]
}

console.log(mt.characters)

// for (const c in char_table) {
//     console.log(c, char_table[c], char_table[c].charCodeAt(0))
// }

console.log(`127--${char_table[127].toString()}--`)
console.log(`0  --${char_table[127].toString()}--`)