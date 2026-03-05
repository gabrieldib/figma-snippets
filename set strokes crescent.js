function curve_set(x, func, f_p) {
    if (!func)
        return x*x
    else
        return func(x, f_p)
}

function power(x,n) {
    return x ** n    
}

const s_min =  1
const s_max = 1000

const sel = figma.currentPage.selection
const steps = sel.length
const step_value = steps / (s_max-s_min)
console.log("step_value=",step_value)

sel.forEach( (e, i) => {
    let stroke_w = curve_set( i*step_value, power,2) * (i+1)
    if (stroke_w < 1) stroke_w = 1
    console.log(stroke_w )
    e.strokeWeight = stroke_w
})
