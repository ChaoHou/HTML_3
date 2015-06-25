var LINE_COLORS = ["red", "green", "blue", "blueViolet", "coral", "crimson", "brown", "aqua", "cornFlowerBlue", "chartreuse", "chocolate", "darkBlue", "greenYellow", "indigo"];

function createGraph(filters, data, type, container){
	if (filters.length == 1){
		if (filters[0].type == "team"){
			var filteredData = getTeamScoreOverYearsData(filters[0].text, data);
			return new LineGraph(filteredData.data, filteredData.minX, filteredData.minY, filteredData.maxX, filteredData.maxY, container);
		}
		else if (filters[0].type == "country"){
			filteredData = getCountryTeamsPerformance(filters[0].text, data);
			console.log(filteredData);
			return new LineGraph(filteredData.data, filteredData.minX, filteredData.minY, filteredData.maxX, filteredData.maxY, container);
		}
	}
}

function removeGraph(graph){
	console.log(graph);
	for(var i = 0; i < graph.elements.length; i++){
		graph.elements[i].remove();
	}
}

function LineGraph(data, minX, minY, maxX, maxY, container){
	var graphWidth = width - offsetTop - offsetRight;
	var graphHeight = 480;
	
	var lineColorIdx = 0;
	
	var x = d3.scale.linear().domain([minX,maxX]).range([0, graphWidth]);
	var y = d3.scale.linear().domain([minY,maxY]).range([graphHeight, 0]);
	
	var xAxis = d3.svg.axis().scale(x).orient("bottom");
	var yAxis = d3.svg.axis().scale(y).orient("left");
	
	var line = d3.svg.line()
					.x(function(d) { return x(d.x); })
					.y(function(d) { return y(d.y); })
					
	this.elements = [];
	
	this.elements[this.elements.length] = container.append("g")
											.attr("class","axis")
											.attr("transform","translate("+offsetLeft+","+(graphHeight+offsetTop)+")")
											.call(xAxis);
	this.elements[this.elements.length] = container.append("g")
											.attr("class","axis")
											.attr("transform","translate("+offsetLeft+","+offsetTop+")")
											.call(yAxis);
	
	for (var i = 0; i < data.length; i++){
		var path = container.append("path")
					.attr("class","graphLine")
					.attr("d",line(data[i].data))
					.attr("stroke",LINE_COLORS[lineColorIdx%LINE_COLORS.length])
					.attr("stroke-width",2)
					.attr("fill", "none")
					.attr("transform","translate("+offsetLeft+","+offsetTop+")");
		
		var totalLength = path.node().getTotalLength();

		path.attr("stroke-dasharray", totalLength + " " + totalLength)
			.attr("stroke-dashoffset", totalLength)
			.transition()
			.duration(1000)
			.ease("linear")
			.attr("stroke-dashoffset", 0);
						
		this.elements[this.elements.length] = path;
				
		this.elements[this.elements.length] = container.append("text")
												.attr("transform", "translate(" + (graphWidth-50) + "," + (offsetTop+100+30*i) + ")")
												.attr("dy", ".35em")
												.attr("text-anchor", "start")
												.attr("font-size", "80%")
												.style("fill", LINE_COLORS[lineColorIdx%LINE_COLORS.length])
												.text(data[i].text);
		
		lineColorIdx++;
	}
	
}

/**
 * format: [{year, [{round, score}]}], x-axis is the week, y-axis is the score, each line is for a season
 */
function getTeamScoreOverYearsData(teamName, data){
	var maxScore = 0;
	var maxRound = 0;
	var currentRound = 1;
	
	var filteredData = [];
	var currentData = [];
	var currentYear = null;
	
	for (var i = 0; i < data.length; i++){
		// if it either just has started the iteration, set the current year into the year of the data it is reading
		// if it has different year, or it is at the end then put it into the returning data
		if (currentYear == null){
			currentYear = data[i].year;
		}
		else if (currentYear != data[i].year || i == data.length-1){
			filteredData[filteredData.length] = {text:currentYear, data:currentData};
			currentData = [];
			currentYear = data[i].year;
		}
		
		//check byes
		while (data[i].round > currentRound){
			currentData[currentData.length] = {x:currentRound, y:999};
			currentRound++;
		}
		
		if (data[i].homeTeam == teamName){
			currentData[currentData.length] = {x:+data[i].round, y:data[i].homeTeamScore};
			if (+data[i].round > maxRound){
				maxRound = +data[i].round;
			}
			if (data[i].homeTeamScore > maxScore){
				maxScore = data[i].homeTeamScore;
			}
			currentRound++;
		}
		else if(data[i].awayTeam == teamName){
			currentData[currentData.length] = {x:+data[i].round, y:data[i].awayTeamScore};
			if (+data[i].round > maxRound){
				maxRound = +data[i].round;
			}
			if (data[i].awayTeamScore > maxScore){
				maxScore = data[i].awayTeamScore;
			}
			currentRound++;
		}
	}
	
	return {data:filteredData, minX:0, minY:0, maxX:maxRound+2, maxY:maxScore};
}

/**
 * format: [teamName, [{year, score}]], x-axis is the year, y-axis is the score
 */
function getCountryTeamsPerformance(country, data){
	var teams = [];
	var years = [];
	var filteredData = [];
	var teamTotalScore = [];
	
	for (var i = 0; i < data.length; i++){
		if (getTeamCountry(data[i].homeTeam) == country){
			// add the team name if it is not in the list
			if (teams.indexOf(data[i].homeTeam) < 0){
				teams[teams.length] = data[i].homeTeam;	
			}
			// add the year when the team plays
			if (years.indexOf(data[i].year) < 0){
				years[years.length] = data[i].year;
			}
			if (typeof teamTotalScore[data[i].homeTeam] === "undefined"){
				teamTotalScore[data[i].homeTeam] = [];
			}
			if (typeof teamTotalScore[data[i].homeTeam][data[i].year] === "undefined"){
				teamTotalScore[data[i].homeTeam][data[i].year] = data[i].homeTeamScore;
			}
			else {
				teamTotalScore[data[i].homeTeam] += data[i].homeTeamScore;
			}
		}
		if (getTeamCountry(data[i].awayTeam) == country){
			// add the team name if it is not in the list
			if (teams.indexOf(data[i].awayTeam) < 0){
				teams[teams.length] = data[i].awayTeam;	
			}
			// add the year when the team plays
			if (years.indexOf(data[i].year) < 0){
				years[years.length] = data[i].year;	
			}
			if (typeof teamTotalScore[data[i].awayTeam] === "undefined"){
				teamTotalScore[data[i].awayTeam] = [];
			}
			if (typeof teamTotalScore[data[i].awayTeam][data[i].year] === "undefined"){
				teamTotalScore[data[i].awayTeam][data[i].year] = data[i].awayTeamScore;
			}
			else {
				teamTotalScore[data[i].awayTeam] += data[i].awayTeamScore;
			}
		}
	}
	
	var maxTotalScore = 0;
	
	for (var i = 0; i < teams.length; i++){
		var totalPointsPerYear = [];
		for (var j = 0; j < years.length; j++){
			var totalScore = teamTotalScore[teams[i]][years[j]];
			if (totalScore > maxTotalScore){
				maxTotalScore = totalScore;
			}
			totalPointsPerYear[totalPointsPerYear.length] = {x:years[j], y:totalScore};
		}
		filteredData[filteredData.length] = {text:teams[i], data:totalPointsPerYear};
	}
	
	console.log(years);
	
	return {data:filteredData, minX:Math.min.apply(Math, years), minY:0, maxX:Math.max.apply(Math, years)+1, maxY:maxTotalScore};
}