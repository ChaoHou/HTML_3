function Graph(data, type, container){
	if (type == "line"){
		return lineGraph(data, container);
	}
}

function lineGraph(data, container){
	var graphWidth = width - offsetTop - offsetRight;
	var graphHeight = 480;
	
	var x = d3.scale.linear().domain([0,14]).range([0, graphWidth]);
	var y = d3.scale.linear().domain([0,20]).range([graphHeight, 0]);
	
	var xAxis = d3.svg.axis().scale(x).orient("bottom");
	var yAxis = d3.svg.axis().scale(y).orient("left");
	
	var line = d3.svg.line()
						.x(function(d) { return x(d.round); })
						.y(function(d) { return y(d.points); });
	container.append("g")
				.attr("class","axis graph")
				.attr("transform","translate("+offsetLeft+","+(graphHeight+offsetTop)+")")
				.call(xAxis);
	container.append("g")
				.attr("class","axis graph")
				.attr("transform","translate("+offsetLeft+","+offsetTop+")")
				.call(yAxis);
	
	for(var i=0;i<data.length;i++){
	container.append("path")
				.attr("class","line graph")
				.attr("d",line(data[i]))
				.attr("stroke","red")
				.attr("stroke-width",2)
				.attr("transform","translate("+offsetLeft+","+offsetTop+")");
	}
}