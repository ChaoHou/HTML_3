/*
    Append action handler to renderer and graphPad
*/
function appendHandlers(data, renderer, graphPad) {

    renderer.force.on("tick", function (e) { tick(e, renderer);})

    renderer.pool.on("click", function () { poolClick(data, graphPad); });

    graphPad.closeButton.on("click", function () { graphPadCloseButtonClick(graphPad); })
}

function graphPadCloseButtonClick(graphPad) {
    graphPad.pad.style("display", "none");
}

function poolClick(data, graphPad) {
    var selectedNodes = [];
    for (var i = 0; i < data.length; i++) {
        selectedNodes.push()
    }

    graphPad.pad.style("display", "block");
}

/*
    will be called every frame
*/
function tick(e, renderer) {
    renderer.nodes.each(tickNode(e.alpha * 0.3))
                .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
}

function tickNode(alpha) {
    var x = offsetLeft, y = (poolHeight - nodeHeight) / 2;
    return function (d) {
        if (isInPool(d)) {
            d.fixedX = x;
            d.fixedY = y;
            x += d.width + nodeGap;
        } else {
            d.fixedX = d.originalX;
            d.fixedY = d.originalY;
        }

        d.y += (d.fixedY - d.y) * alpha;
        d.x += (d.fixedX - d.x) * alpha;
        
    }
}

function isInPool(d) {
    //console.log(d.y);
    return d.y > 0 && d.y < poolHeight - nodeHeight;
}
