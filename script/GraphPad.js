function GraphPad() {
    var pad = d3.select("body")
					.append("svg")
					.attr("id", "pad")
					.attr("height", height)
					.attr("width", width)
					.style("position", "absolute")
					.style("display", "none");
    this.pad = pad;

    this.background = pad.append("rect")
                            .attr("x", 0)
                            .attr("y", 0)
                            .attr("fill", "white")
                            .attr("width", width)
                            .attr("height", height)
                            .attr("id", "background");

    this.closeButton = pad.append("circle")
									.attr("cx", width - 50)
									.attr("cy", 50)
									.attr("r", 20)
									.attr("id", "closeButton")
									.attr("fill", "red");
}