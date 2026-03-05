function cr (x,y, w, h) {
    const r = figma.createRectangle()
    r.x = x
    r.y = y
    r.resize(w, h)
    r.name = "Ret"
}

function curve_set(x, func, f_p) {
    if (!func)
        return x // linear
    else
        return func(x, f_p)
}

function power(x,n) {
    return x ** n    
}

function slow_descent(x, n) {
    return (1-(x ** n))
}

const max_col = 50
const max_row = 50
const sq_side = 10
const h_gap   = 2
const v_gap   = 2
const step_size_col = 1 / max_col
const step_size_row = 1 / max_row

for (let col = 0; col < max_col; col++ ){
    for (let row = 0; row < max_row; row++ ){
        const x = col * sq_side + col * h_gap
        const y = row * sq_side + row * h_gap
        const w = sq_side * curve_set(step_size_col*col, power, 0.5)
        const h = sq_side * curve_set(step_size_row*row, slow_descent, 1.5)
        cr(x, y, w, h)        
    }
}