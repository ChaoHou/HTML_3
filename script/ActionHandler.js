/*
    Append action handler to renderer and graphPad
*/
function appendHandlers(filters, data, renderer, graphPad) {

    renderer.force.on("tick", function (e) { tick(e, filters, data, renderer);})

    renderer.pool.on("click", function () { poolClick(filters, data, graphPad); });

    graphPad.closeButton.on("click", function () { graphPadCloseButtonClick(graphPad); })
}

function graphPadCloseButtonClick(graphPad) {
    graphPad.pad.style("display", "none");
}
/*
    display filtered data
*/
function poolClick(filters, data, graphPad) {
    
    var selectFilters = getSelectFilters(filters);
    var filteredData = applyFilters(selectFilters, data);

    //you have filtered data, display them
	
	var graph = new Graph(filteredData, "line", graphPad.pad);

    graphPad.pad.style("display", "block");
}

/*
    will be called every frame
*/
function tick(e, filters, data, renderer) {
    var selectFilters = getSelectFilters(filters);
    var filteredData = applyFilters(selectFilters, data);

    renderer.nodes.each(tickNode(e.alpha * 0.3))
                .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
                .classed("disable", function (d) { return disableFilter(selectFilters, filteredData, d); });

    renderer.resultText.text("Result: "+filteredData.length);
}

/*
    place filters in the pool one after one
*/
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

/*
    return value format:
        array of object:
            { 
            type: "type",
            text:"text"
            }
            type includes: team, country, year, graph, venue
            text is the displaying names
*/
function getSelectFilters(filters) {
    var selectedNodes = [];
    for (var i = 0; i < filters.length; i++) {
        if (isInPool(filters[i])) {
            selectedNodes.push(filters[i]);
        }
    }
    return selectedNodes;
}

/*
    return value format:
        array of object:
            {
            year:2008,
            round:1,
            datetime:
            datetime,
            homeTeam:"homeTeam",
            awayTeam:"awayTeam",
            homeTeamScore: 50,
            awayTeamScore: 60,
            venue:"venue"
            }
*/
function applyFilters(filters, data) {
    var filteredData = [];

    if (filters.length == 0) {
        return data;
    }

    for (var i = 0; i < data.length; i++) {
        if (applyFiltersToSingleRecord(filters, data[i])) {
            //pass all the filters
            filteredData.push(data[i]);
        }
    }

    return filteredData;
}

function applyFiltersToSingleRecord(filters, record) {
    for (var i = 0; i < filters.length; i++) {
        if (filters[i].type == "team") {
            if (record.homeTeam != filters[i].text && record.awayTeam != filters[i].text) {
                return false;
            }
        } else if (filters[i].type == "graph") {

        } else if (filters[i].type == "country") {

        } else {
            if (record[filters[i].type] != filters[i].text) {
                return false;
            }
        }
    }
    return true;
}

function disableFilter(filters, data, d) {
    //d.disabled = false;
    if (filters.length == 0) {
        return false;
    }

    for (var i = 0; i < data.length; i++) {
        if (d.type == "team") {
            if (data[i].homeTeam == d.text || data[i].awayTeam == d.text) {
                return false;
            }
        } else if (d.type == "country") {

        } else if (d.type == "graph") {
            return false;
        } else {

        }
    }
    //d.disabled = true;
    return true;
}