// simple logarithmic spiral generator for figma
// all custom identifiers use snake_case on purpose

const spiral_params = {
    center_x: 200,
    center_y: 200,
    a: 4,              // base radius factor
    b: 0.18,           // growth rate (bigger = more aggressive)
    t_start: 0,
    t_end: 8 * Math.PI,
    t_step: 0.02,
    stroke_hex: "#000000",
    stroke_width: 4
};

function build_spiral_path(cx, cy, a, b, t_start, t_end, t_step) {
    let d = "";
    let is_first = true;

    for (let t = t_start; t <= t_end; t += t_step) {
        const r = a * Math.exp(b * t);

        // standard math orientation: +y is up, so subtract sin term
        const x = cx + r * Math.cos(t);
        const y = cy - r * Math.sin(t);

        if (is_first) {
            d += "M " + x + " " + y + " ";
            is_first = false;
        } else {
            d += "L " + x + " " + y + " ";
        }
    }

    return d.trim();
}

function build_svg_document(width, height, d, stroke_hex, stroke_width) {
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" ' +
        'width="' + width + '" height="' + height + '" ' +
        'viewBox="0 0 ' + width + " " + height + '">' +
        '<path d="' + d + '" ' +
        'fill="none" ' +
        'stroke="' + stroke_hex + '" ' +
        'stroke-width="' + stroke_width + '" ' +
        'stroke-linecap="round" ' +
        'stroke-linejoin="round" />' +
        "</svg>"
    );
}

function create_spiral_node() {
    const width = spiral_params.center_x * 2;
    const height = spiral_params.center_y * 2;

    const d = build_spiral_path(
        spiral_params.center_x,
        spiral_params.center_y,
        spiral_params.a,
        spiral_params.b,
        spiral_params.t_start,
        spiral_params.t_end,
        spiral_params.t_step
    );

    const svg_string = build_svg_document(
        width,
        height,
        d,
        spiral_params.stroke_hex,
        spiral_params.stroke_width
    );

    const nodes = figma.createNodeFromSvg(svg_string);
    const node = nodes; // createNodeFromSvg returns the root node

    figma.currentPage.appendChild(node);

    // center in viewport
    const center = figma.viewport.center;
    node.x = center.x - width / 2;
    node.y = center.y - height / 2;

    figma.currentPage.selection = [node];
    figma.viewport.scrollAndZoomIntoView([node]);

    return node;
}

// entry point
(function run_spiral_plugin() {
    create_spiral_node();
    figma.closePlugin("Spiral created");
})();
