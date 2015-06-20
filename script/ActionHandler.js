/*
    Append action handler to renderer and graphPad
*/
function appendHandlers(filters, data, renderer, graphPad) {

    renderer.force.on("tick", function (e) { tick(e, filters, data, renderer);})

    renderer.pool.on("click", function () { poolClick(filters, graphPad); });

    graphPad.closeButton.on("click", function () { graphPadCloseButtonClick(graphPad); })
}

function graphPadCloseButtonClick(graphPad) {
    graphPad.pad.style("display", "none");
}

function poolClick(filters, graphPad) {
    
    var selectNodes = getSelectFilters(filters);

    graphPad.pad.style("display", "block");
}

/*
    will be called every frame
*/
function tick(e, filters, data, renderer) {
    renderer.nodes.each(tickNode(e.alpha * 0.3))
                .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

    var filteredData = applyFilters(filters, data);
    renderer.resultText.text("Result: "+filteredData.length);
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
    return d.y > 0 && d.y < poolHeight - nodeHeight;
}

function getSelectFilters(filters) {
    var selectedNodes = [];
    for (var i = 0; i < filters.length; i++) {
        if (isInPool(filters[i])) {
            selectedNodes.push(filters[i]);
        }
    }
    return selectedNodes;
}

function applyFilters(filters,data) {
    var selectFilters = getSelectFilters(filters);
    return data;
}