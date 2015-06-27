var COLORS = ["green", "red", "blue", "blueViolet", "coral", "crimson", "brown", "aqua", "cornFlowerBlue", "chartreuse", "chocolate", "darkBlue", "greenYellow", "indigo"];

function createGraph(filters, data, type, container){
	if (filters.length == 1){
		if (filters[0].type == "team"){
			var filteredData = getTeamScoreOverYears(filters[0].text, null, null, data);
			return new LineGraph(filteredData.title, filteredData.data, filteredData.minX, filteredData.minY, filteredData.maxX, filteredData.maxY, container);
		}
		if (filters[0].type == "country"){
			filteredData = getCountryTeamsPerformance(filters[0].text, null, null, data);
			return new LineGraph(filteredData.title, filteredData.data, filteredData.minX, filteredData.minY, filteredData.maxX, filteredData.maxY, container);
		}
	}
	if (filters.length == 2){
		if (filters[0].type == "team" && filters[1].type == "team"){
			var teams = [filters[0].text, filters[1].text];
			filteredData = getPerformanceOfTeams(teams, data);
			return new PieChart(filteredData.title, filteredData.data, container);
			
		}
		if (filters[0].type == "team" && filters[1].type == "venue"){
			filteredData = getWinningRateVenue(filters[0].text, filters[1].text, data);
			return new PieChart(filteredData.title, filteredData.data, container);
		}
		if (filters[0].type == "team" && filters[1].type == "year"){
			var filteredData = getTeamScoreOverYears(filters[0].text, null, filters[1].text, data);
			return new LineGraph(filteredData.title, filteredData.data, filteredData.minX, filteredData.minY, filteredData.maxX, filteredData.maxY, container);
		}
		if (filters[0].type == "team" && filters[1].type == "season"){
			var filteredData = getTeamScoreOverYears(filters[0].text, filters[1].text, null, data);
			return new LineGraph(filteredData.title, filteredData.data, filteredData.minX, filteredData.minY, filteredData.maxX, filteredData.maxY, container);
		}
	}
	if (filters.length == 3){
		if (filters[0].type == "team" && filters[1].type == "season" && filters[2].type == "year"){
			filteredData = getTeamScoreOverYears(filters[0].text, filters[1].text, filters[2].text, data);
			return new LineGraph(filteredData.title, filteredData.data, filteredData.minX, filteredData.minY, filteredData.maxX, filteredData.maxY, container);
		}
		if (filters[0].type == "season" && filters[1].type == "country" && filters[2].type == "year"){
			filteredData = getCountryTeamsPerformance(filters[1].text, filters[0].text, filters[2].text, data);
			return new LineGraph(filteredData.title, filteredData.data, filteredData.minX, filteredData.minY, filteredData.maxX, filteredData.maxY, container);			
		}
	}
}

function removeGraph(graph){
	for(var i = 0; i < graph.elements.length; i++){
		graph.elements[i].remove();
	}
}

function LineGraph(title, data, minX, minY, maxX, maxY, container){
	var graphWidth = width - offsetLeft-offsetRight;
	var graphHeight = 480;
	var marginTop = 40;
	
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
											.attr("transform","translate("+offsetLeft+","+(graphHeight+offsetTop+marginTop)+")")
											.call(xAxis);
	this.elements[this.elements.length] = container.append("g")
											.attr("class","axis")
											.attr("transform","translate("+offsetLeft+","+(offsetTop+marginTop)+")")
											.call(yAxis);
	
	for (var i = 0; i < data.length; i++){
		var path = container.append("path")
					.attr("class","graphLine")
					.attr("d",line(data[i].data))
					.attr("stroke",COLORS[lineColorIdx%COLORS.length])
					.attr("stroke-width",2)
					.attr("fill", "none")
					.attr("transform","translate("+offsetLeft+","+(offsetTop+marginTop)+")")
					.style("stroke", function(d) { return COLORS[i]; });
		
		var totalLength = path.node().getTotalLength();

		path.attr("stroke-dasharray", totalLength + " " + totalLength)
			.attr("stroke-dashoffset", totalLength)
			.transition()
			.duration(1000)
			.ease("linear")
			.attr("stroke-dashoffset", 0);
			
		this.elements[this.elements.length] = path;
			
		var points = container.selectAll(".point")
			.data(data[i].data)
			.enter().append("svg:circle")
				.attr("stroke", "black")
				.attr("fill", COLORS[i])
				.attr("cx", function(d) { return x(d.x); })
				.attr("cy", function(d) { return y(d.y); })
				.attr("r", 3)
				.attr("transform","translate("+offsetLeft+","+(offsetTop+marginTop)+")");
						
		this.elements[this.elements.length] = points;
				
		this.elements[this.elements.length] = container.append("text")
												.attr("transform", "translate(" + (graphWidth-60) + "," + (offsetTop+marginTop+100+30*i) + ")")
												.attr("dy", ".35em")
												.attr("text-anchor", "start")
												.attr("font-size", "80%")
												.style("fill", COLORS[lineColorIdx%COLORS.length])
												.text(data[i].text);
		
		lineColorIdx++;
	}
	
	this.elements[this.elements.length] = container.append("text")
											.attr("text-anchor", "middle")
											.attr("transform", "translate(" + (graphWidth/2) + "," + offsetTop + ")")
											.style("font-size", "150%")
											.text(title);
	
}

function PieChart(title, data, container){
	var graphWidth = width - offsetLeft - offsetRight;
	var graphHeight = 480;
	
	var marginTop = 100;
	
	var radius = Math.min(graphWidth, graphHeight)/2;
	
	var arc = d3.svg.arc()
		.outerRadius(radius - 10)
		.innerRadius(0);
		
	var pie = d3.layout.pie()
		.sort(null)
		.value(function(d) { return d.data; });
					
	this.elements = [];
	
	var g = container.append("g")
		.attr("transform", "translate(" + graphWidth / 2 + "," + (graphHeight / 2 + marginTop)+ ")");
		
	this.elements[this.elements.length] = g;

	var g2 = g.selectAll(".arc")
		.data(pie(data))
		.enter().append("g")
		.attr("class", "arc");
	
	this.elements[this.elements.length] = g2;
	
	g2.append("path")
		.attr("d", arc)
		.style("fill", function(d, i) { return COLORS[i]; });

	g2.append("text")
		.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
		.attr("dy", ".35em")
		.style("text-anchor", "middle")
		.style("fill", "white")
		.style("font-size", "70%")
		.text(function(d, i) { return data[i].text+": "+data[i].data; });
		
	this.elements[this.elements.length] = container.append("text")
											.attr("text-anchor", "middle")
											.attr("transform", "translate(" + (graphWidth/2) + "," + offsetTop + ")")
											.style("font-size", "150%")
											.text(title);
}

function checkSeason(season, round){
	if (season == "regular"){
		return (round >= 1 && round <= 14);
	}
	else if (season == "final"){
		minRound = 14;
		return (round >= 15);
	}
	return true;
}

/**
 * format: [{year, [{round, score}]}], x-axis is the week, y-axis is the score, each line is for a season
 */
function getTeamScoreOverYears(teamName, season, year, data){
	var maxScore = 0;
	var minRound = 0;
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
		
		if (checkSeason(season, data[i].round)){
			//check byes
			while (data[i].round > currentRound){
				currentData[currentData.length] = {x:currentRound, y:999};
				currentRound++;
			}	
		
			if (year == null || year == currentYear){
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
		}
	}
	
	return {title:teamName.toUpperCase()+" - THE PERFORMANCE/TOTAL SCORE STATISTICS", data:filteredData, minX:minRound, minY:0, maxX:maxRound+2, maxY:maxScore};
}

/**
 * format: [teamName, [{year, score}]], x-axis is the year, y-axis is the score
 */
function getCountryTeamsPerformance(country, season, year, data){
	var teams = [];
	var years = [];
	var filteredData = [];
	var teamTotalScore = [];
	
	for (var i = 0; i < data.length; i++){
		if (year == null || data[i].year == year){
			if (season == null || checkSeason(season, data[i].round)){
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
						teamTotalScore[data[i].homeTeam][data[i].year] += data[i].homeTeamScore;
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
						teamTotalScore[data[i].awayTeam][data[i].year] += data[i].awayTeamScore;
					}
				}
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
	
	return {title:"THE PERFORMANCE/TOTAL SCORE OF EACH TEAM FROM "+country.toUpperCase(), data:filteredData, minX:Math.min.apply(Math, years)-1, minY:0, maxX:Math.max.apply(Math, years)+1, maxY:maxTotalScore};
}

/**
 * format: [{text:team, data:score}]
 */
function getPerformanceOfTeams(teams, data){
	var filteredData = [];
	
	// initialise the score
	for (var i = 0; i < teams.length; i++){
		filteredData[filteredData.length] = {text:teams[i], data:0};
	}
	
	// get the total score of each team
	for (var i = 0; i < data.length; i++){
		for (var j = 0; j < teams.length; j++){
			if (data[i].homeTeam == teams[j]){
				filteredData[j].data += data[i].homeTeamScore; 
			}
			else if (data[i].awayTeam == teams[j]){
				filteredData[j].data += data[i].awayTeamScore;
			}
		}
	}
	return {title:"THE PERFORMANCE/TOTAL SCORE IN ALL SEASONS - "+teams[0].toUpperCase()+" VS "+teams[1].toUpperCase(), data:filteredData};
}

function getWinningRateVenue(team, venue, data){
	var filteredData = [];
	var winCount = 0;
	var loseCount = 0;
	
	for (var i = 0; i < data.length; i++){
		if (data[i].homeTeam == team && data[i].venue == venue){
			if (data[i].homeTeamScore > data[i].awayTeamScore){
				winCount++;
			}
			else {
				loseCount++;
			}
		}
		else if (data[i].awayTeam == team && data[i].venue == venue){
			if (data[i].awayTeamScore > data[i].homeTeamScore){
				winCount++;
			}
			else {
				loseCount++;
			}
		}
	}
	if (winCount > 0){
		filteredData[filteredData.length] = {text:"Win", data:winCount};
	}
	if (loseCount > 0){
		filteredData[filteredData.length] = {text:"Lose", data:loseCount};
	}
	
	return {title: "WIN/LOSE RATE OF "+team.toUpperCase()+" IN "+venue.toUpperCase(), data:filteredData};
}