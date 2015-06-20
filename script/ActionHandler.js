function appendHandlers(renderer, graphPad) {

    renderer.force.on("tick", function (e) {
        //calculateFixedPos(data);
        renderer.title.each(graviry(e.alpha * 0.3)).attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
        renderer.nodes.each(graviry(e.alpha * 0.3))
            .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
    })
}

function graviry(alpha) {
    return function (d) {
        d.y += (d.fixedY - d.y) * alpha;
        d.x += (d.fixedX - d.x) * alpha;
    }
}