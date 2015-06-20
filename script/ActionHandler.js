function appendHandlers(renderer, graphPad) {

    renderer.force.on("tick", function (e) { tick(e, renderer);})

    renderer.pool.on("click", function () { poolClick(graphPad); });

    graphPad.closeButton.on("click", function () { graphPadCloseButtonClick(graphPad); })
}

function graphPadCloseButtonClick(graphPad) {
    graphPad.pad.style("display", "none");
}

function poolClick(graphPad) {
    graphPad.pad.style("display", "block");
}

function tick(e, renderer) {
    //calculateFixedPos(data);
    renderer.title.each(graviry(e.alpha * 0.3))
                .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
    renderer.nodes.each(graviry(e.alpha * 0.3))
                .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
}

function graviry(alpha) {
    return function (d) {
        d.y += (d.fixedY - d.y) * alpha;
        d.x += (d.fixedX - d.x) * alpha;
    }
}