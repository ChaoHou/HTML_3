/*
    Renderer class for main screen
*/
function Renderer(data, titleData) {
    initializePos(data);

    this.svg = d3.select("body")
            .append("svg")
            .attr("id", "svg")
            .attr("height", height)
            .attr("width", width);

    this.pool = this.svg.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", width)
                .attr("height", poolHeight)
                .attr("id", "pool");

    this.force = d3.layout.force()
                          .nodes(data)
                          .size([width, height])
                          .charge(0)
                          .gravity(0)
                          .start();

    this.nodes = this.svg.selectAll("g")
                .data(data)
                .enter()
                .append("g")
                .call(drag());

    this.nodes.append("rect")
        .attr("width", function (d) { return d.width; })
        .attr("height", nodeHeight)
        .attr("class", function (d) { return d.type; });

    this.nodes.append("text")
        .style("font-size", textHeight)
        .attr("textLength", function (d) { return d.textLength; })
        .attr("dy", function (d, i) { return textHeight / 2; })
        .attr("x", nodeHeight / 4)
        .attr("y", nodeHeight / 2)
        .text(function (d) { return d.text; })

    this.title = this.svg.selectAll(".title")
                    .data(titleData)
                    .enter()
                    .append("text")
                    .classed("title", true)
                    .text(function (d) { return d.text })
                    .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });;

    this.resultText = this.svg.append("text")
                                .classed("result", true)
                                .style("font-size", textHeight)
                                .style("font-family", "Impact")
                                .attr("x", resultTextX)
                                .attr("y", poolHeight - nodeGap)
                                .text("result:");
}

/*
    Calculate fixed position for given data
        1. Trying to place objects one ofter one,if exceed the width limit, start a new line
        2. Place a gap between groups for displaying title
        3. Return the height of the last item
*/
function calculateFixedPos(array) {
    array.sort(function (a, b) { return a.group * 100 + a.index - b.group * 100 - b.index });

    var x = offsetLeft, y = offsetTop + groupGap;
    for (var i = 0; i < array.length; i++) {
        array[i].fixedX = x;
        array[i].fixedY = y;

        if (i + 1 < array.length) {
            if (array[i].group != array[i + 1].group) {
                x = offsetLeft;
                y = y + groupGap + nodeHeight;
                continue;
            }

            var newWidth = x + array[i].width + nodeGap
                            + array[i + 1].width - offsetLeft;
            if (newWidth <= widthLimit) {
                x = x + array[i].width + nodeGap;
            } else {
                x = offsetLeft;
                y = y + nodeGap + nodeHeight;
            }
        }
    }

    return y;
}

function initializePos(data){
    for (var i = 0; i < data.length; i++) {
        data[i].x = data[i].fixedX;
        data[i].y = data[i].fixedY;
        data[i].originalX = data[i].fixedX;
        data[i].originalY = data[i].fixedY;
    }
}

function dragStart(renderer) {
    renderer.force.stop();
}

function dragMove(d, filters, data, renderer) {
    if (d.fixed) {
        return;
    }
    d.px += d3.event.dx;
    d.py += d3.event.dy;
    d.x += d3.event.dx;
    d.y += d3.event.dy;

    renderer.nodes.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
}

function dragEnd(d, filters, data, renderer) {
    renderer.nodes.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
    renderer.force.resume();
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
            // the country filter will accept the record that is:
            // 1. the home team country equals given country
            // (to be deside)2. the away team country not equals given country
            var homeTeamCountry = getTeamCountry(record.homeTeam);
            var awayTeamCountry = getTeamCountry(record.awayTeam);
            if (homeTeamCountry != filters[i].text){ //&& awayTeamCountry != filters[i].text) {
                return false;
            }
            //if (awayTeamCountry == filters[i].text) {
                //return false;
            //}
        } else {
            if (record[filters[i].type] != filters[i].text) {
                return false;
            }
        }
    }
    return true;
}

function disableFilter(filters, data, d) {
    d.fixed = false;
    if (filters.length == 0) {
        return false;
    }
    var country = getCountryFilter(filters);

    for (var i = 0; i < data.length; i++) {
        if (d.type == "team") {
            //if (country && getTeamCountry(d.text) == country.text) {
                //return false;
            //}

            if (data[i].homeTeam == d.text || data[i].awayTeam == d.text) {
                return false;
            }

            
        } else if (d.type == "country") {
            if (country && country.text == d.text) {
                return false;
            }
        } else if (d.type == "graph") {
            return false;
        } else {
            if (data[i][d.type] == d.text) {
                return false;
            }
        }
    }
    d.fixed = true;
    return true;
}

function getCountryFilter(filters){
    for (var i = 0; i < filters.length; i++){
        if(filters[i].type == "country"){
            return filters[i];
        }
    }
    return null;
}
