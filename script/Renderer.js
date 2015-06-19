function render(data, titleData) {
    var svg = d3.select("body")
            .append("svg")
            .attr("id", "svg")
            .attr("height", height)
            .attr("width", width)
            .style("position", "absolute");


    var pool = svg.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("fill", "purple")
                .attr("width", width)
                .attr("height", poolHeight)
                .attr("id", "pool");

    var force = d3.layout.force()
                          .nodes(data)
                          .size([width, height])
                          .charge(0)
                          .gravity(0);
    force.start();

    var nodes = svg.selectAll("g")
                .data(data)
                .enter()
                .append("g")
                .call(force.drag);

    nodes.append("rect")
        .attr("width", function (d) { return d.width + nodeHeight / 2; })
        .attr("height", nodeHeight)
        .style("fill", function (d) { return d.color })

    nodes.append("text")
        .style("font-size", textHeight)
        .style("font-family", "Impact")
        .attr("textLength", function (d) { return d.width; })
        .attr("dy", function (d, i) { return textHeight / 2; })
        .attr("x", nodeHeight / 4)
        .attr("y", nodeHeight / 2)
        .attr("fill", "black")
        .text(function (d) { return d.text; })

    var title = svg.selectAll(".title")
                    .data(titleData)
                    .enter()
                    .append("text")
                    .attr("class", ".title")
                    .style("font-size", titleHeight)
                    .style("font-family", "Impact")
                    .text(function (d) { return d.text });

    force.on("tick", function (e) {
        calculateFixedPos(data);
        title.each(graviry(e.alpha * 0.2)).attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
        nodes.each(graviry(e.alpha * 0.2))
            .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
    })

    function graviry(alpha) {
        return function (d) {
            d.y += (d.fixedY - d.y) * alpha;
            d.x += (d.fixedX - d.x) * alpha;
        }
    }

}
