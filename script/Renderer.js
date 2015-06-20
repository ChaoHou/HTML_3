/*
    Renderer class for main screen
*/
function Renderer(data, titleData) {
    initializePos(data);

    this.svg = d3.select("body")
            .append("svg")
            .attr("id", "svg")
            .attr("height", height)
            .attr("width", width)
            .style("position", "absolute");

    this.pool = this.svg.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                //.attr("fill", "purple")
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
                .call(this.force.drag);

    this.nodes.append("rect")
        .attr("width", function (d) { return d.width; })
        .attr("height", nodeHeight)
        .attr("class", function (d) { return d.type;})
        //.style("fill", function (d) { return d.color })

    this.nodes.append("text")
        .style("font-size", textHeight)
        .style("font-family", "Impact")
        .attr("textLength", function (d) { return d.textLength; })
        .attr("dy", function (d, i) { return textHeight / 2; })
        .attr("x", nodeHeight / 4)
        .attr("y", nodeHeight / 2)
        //.attr("fill", "black")
        .text(function (d) { return d.text; })

    this.title = this.svg.selectAll(".title")
                    .data(titleData)
                    .enter()
                    .append("text")
                    .attr("class", ".title")
                    .style("font-size", titleHeight)
                    .style("font-family", "Impact")
                    .text(function (d) { return d.text })
                    .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });;

    this.resultText = this.svg.append("text")
                                .attr("class", "result")
                                .style("font-size", textHeight)
                                .style("font-family", "Impact")
                                .attr("x", resultTextX)
                                .attr("y", 100)
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


