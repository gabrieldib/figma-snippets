function ce (x,y, w, h) {    
    const c = figma.createEllipse()
    c.resize(w,h)
    c.strokes = [
        {
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
        }
    ]
    c.x = x
    c.y = y
    c.fills=[]
}

function curve_set(x, func, f_p) {
    if (!func)
        return x*x
    else
        return func(x, f_p)
}

function cube(x) {
    return x*x*x    
}

function power(x,n) {
    return x ** n    
}

const max_steps = 30
const step = 1/max_steps
const start_step = 0
const max_size = 1000 + start_step

for (let i=start_step; i < max_steps; i++) {
    const curved_step = curve_set(step * i, power, 2)
    const dim = max_size * curved_step
    console.log(dim)
    ce(-dim/2, -dim/2, dim, dim)
}