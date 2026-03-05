function cubicBezier(t, p0, p1, p2, p3) {
  const t2 = t * t;
  const t3 = t2 * t;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
 
  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y
  };
}

function clone(val) {
  return JSON.parse(JSON.stringify(val))
}

sel = figma.currentPage.selection.slice(0, 2)

let curves = []

sel.forEach( node => {
  const x = node.x;
  const y = node.y;
 
  // extract the 4 points coordinates
  curves.push(node.vectorPaths[0].data.split(" ")
    .filter(c => !["M", "C"].includes(c))
    .map((c, i) => {
      const num = parseFloat(c);
      const offset = (i % 2 === 0) ? x : y; // even index = x, odd index = y
      return Math.round((num + offset) * 1000) / 1000;
    })
  )
})

/*
  pass the points to the cubicBezier() to get the coordinate of the
  line start and line end
  create a vector and format it as
  {
    "windingRule": "NONE",
    "data": "M x1 y1 L x2 y2"
  }
  repeat for as many segments you want
*/
let segments = 50
let curve1_coords
let curve2_coords

for (let i = 0; i <= segments; i++) {
  let p0 = { x: curves[0][0], y: curves [0][1]}
  let p1 = { x: curves[0][2], y: curves [0][3]}
  let p2 = { x: curves[0][4], y: curves [0][5]}
  let p3 = { x: curves[0][6], y: curves [0][7]}
 
  curve1_coords = cubicBezier(i*(1/segments), p0, p1, p2, p3 )

  p0 = { x: curves[1][0], y: curves [1][1]}
  p1 = { x: curves[1][2], y: curves [1][3]}
  p2 = { x: curves[1][4], y: curves [1][5]}
  p3 = { x: curves[1][6], y: curves [1][7]}
 
  curve2_coords = cubicBezier(i*(1/segments), p0, p1, p2, p3 )

  const v = figma.createVector()
  const svg_path = `M ${curve1_coords.x} ${curve1_coords.y} L ${curve2_coords.x} ${curve2_coords.y}`
  console.log(svg_path)
  const vp = [{
    "windingRule": "NONE",
    "data": svg_path
  }]
  v.vectorPaths = vp
  const vs = clone(v.strokes)
  vs[0].color.r = 1
  vs[0].color.g = 1
  vs[0].color.b = 1
  v.strokes = vs
  v.strokeWeight = 2
}