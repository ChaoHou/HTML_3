function Graph(filters, data, type, container){
	
	if (filters.length == 1){
		if (filters[0].type == "team"){
			var filteredData = getTeamScoreOverYearsData(filters[0].text, data);
			console.log(data);
			console.log(filteredData);
			return lineGraph(filteredData.data, filteredData.maxX, filteredData.maxY, container);
		}
	}
}

function lineGraph(data, maxX, maxY, container){
	var LINE_COLORS = ["red", "green", "blue", "blueViolet", "coral", "crimson", "brown", "aqua", "cornFlowerBlue", "chartreuse", "chocolate", "darkBlue", "greenYellow", "indigo"];
	var lineColorIdx = 0;
	
	var graphWidth = width - offsetTop - offsetRight;
	var graphHeight = 480;
	
	var x = d3.scale.linear().domain([0,maxX]).range([0, graphWidth]);
	var y = d3.scale.linear().domain([0,maxY]).range([graphHeight, 0]);
	
	var xAxis = d3.svg.axis().scale(x).orient("bottom");
	var yAxis = d3.svg.axis().scale(y).orient("left");
	
	var line = d3.svg.line()
					.x(function(d) { return x(d.round); })
					.y(function(d) { return y(d.score); });
	
	container.append("g")
				.attr("class","axis")
				.attr("transform","translate("+offsetLeft+","+(graphHeight+offsetTop)+")")
				.call(xAxis);
	container.append("g")
				.attr("class","axis")
				.attr("transform","translate("+offsetLeft+","+offsetTop+")")
				.call(yAxis);
	
	for (var i = 0; i < data.length; i++){
		container.append("path")
					.attr("class","graphLine")
					.attr("d",line(data[i].data))
					.attr("stroke",LINE_COLORS[lineColorIdx%LINE_COLORS.length])
					.attr("stroke-width",2)
					.attr("fill", "none")
					.attr("transform","translate("+offsetLeft+","+offsetTop+")");
		lineColorIdx++;
	}
}

/**
 * format: [{year, [{round, score}]}]
 */
function getTeamScoreOverYearsData(text, data){
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
			currentData[currentData.length] = {round:currentRound, score:999};
			currentRound++;
		}
		
		if (data[i].homeTeam == text){
			currentData[currentData.length] = {round:+data[i].round, score:data[i].homeTeamScore};
			if (+data[i].round > maxRound){
				maxRound = +data[i].round;
			}
			if (data[i].homeTeamScore > maxScore){
				maxScore = data[i].homeTeamScore;
			}
			currentRound++;
		}
		else if(data[i].awayTeam == text){
			currentData[currentData.length] = {round:+data[i].round, score:data[i].awayTeamScore};
			if (+data[i].round > maxRound){
				maxRound = +data[i].round;
			}
			if (data[i].awayTeamScore > maxScore){
				maxScore = data[i].awayTeamScore;
			}
			currentRound++;
		}
	}
	
	return {data:filteredData, maxX:maxRound, maxY:maxScore};
}