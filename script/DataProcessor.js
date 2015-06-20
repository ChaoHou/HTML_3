/*
    load multiple files, call "start" when loading finished
*/
function load(start) {
    return queue()
    .defer(loadData, "data/2008-Table1.csv", 2008)
    .defer(loadData, "data/2009-Table1.csv", 2009)
    .defer(loadData, "data/2010-Table1.csv", 2010)
    .defer(loadData, "data/2011-Table1.csv", 2011)
    .defer(loadData, "data/2012-Table1.csv", 2012)
    .defer(loadData, "data/2013-Table1.csv", 2013)
    .awaitAll(start);
}

/*
    construct data from the loaded files.
*/
function processData(results) {

    var teamMap = {
        "Adelaide Thunderbirds": "Australia",
        "Canterbury Tactix": "New Zealand",
        "Central Pulse": "New Zealand",
        "Melbourne Vixens": "Australia",
        "New South Wales Swifts": "Australia",
        "Northern Mystics": "New Zealand",
        "Queensland Firebirds": "Australia",
        "Southern Steel": "New Zealand",
        "Waikato Bay of Plenty Magic": "New Zealand",
        "West Coast Fever": "Australia",
    };

    var teams = constructFromProperty(results,"homeTeam","awayTeam");
    initArray(teams, "team", 0);

    var countries = [{ "text": "New Zealand" },
                    { "text": "Australia" }];
    initArray(countries, "country", 1);

    var years = constructFromProperty(results, "year", null);

    initArray(years, "year", 2);

    var graphs =
        [
            { "text": "Line chart" },
            { "text": "Bar chart" },
            { "text": "Pie chart" },
            { "text": "table" }
        ];
    initArray(graphs, "graph", 3);

    var venues = constructFromProperty(results, "venue", null);
    initArray(venues, "venue", 4);

    var data = teams.concat(countries, years, graphs, venues);

    //reset the height to hold the entire data
    height = calculateFixedPos(data) + groupGap + nodeHeight;

    return data;
}

/*
    load a single csv file
*/
function loadData(file, year, callback) {
    d3.csv(file,
        function (d) {
            var date = d.Date.split(/[\s,]+/);
            var format = d3.time.format("%Y %e %B");
            var datetime = format.parse(year + " " + date[1] + " " + date[2]);

            if(datetime){
                return {
                    year: year,
                    round: d.Round,
                    date: datetime,
                    homeTeam: d["Home Team"],
                    awayTeam: d["Away Team"],
                    venue: d.Venue
                }
            }
        },
        function (data) {
            callback(null, data);
        })
}

/*
    contruct a sorted array which holds the distict proporty value from given data
*/
function constructFromProperty(data, p1, p2) {
    var n = {}, r = [];
    for(var i=0;i<data.length;i++){
        for (var j = 0; j < data[0].length; j++) {
            if (p1 && !n[data[i][j][p1]]) {
                n[data[i][j][p1]] = true;
                r.push({ "text": data[i][j][p1]});
            }
            if (p2 && !n[data[i][j][p2]]) {
                n[data[i][j][p2]] = true;
                r.push({ "text": data[i][j][p2]});
            }
        }
    }

    return r.sort(function (a, b) { return a.text.toString().localeCompare(b.text); });
}

/*
    initialize array
*/
function initArray(data, type, group) {
    for (var i = 0; i < data.length; i++) {
        data[i].type = type;
        data[i].index = i;
        data[i].textLength = textLength(data[i].text)
        data[i].width = data[i].textLength + nodeHeight / 2;
        data[i].group = group;
    }
    return data;
}

/*
    generate title data for each group
*/
function generateTitles(data) {
    data.sort(function (a, b) { return a.group * 100 + a.index - b.group * 100 - b.index });
    var array = [];

    for (var i = 0; i < data.length; i++) {
        var title = {};
        title.type = data[i].type;
        title.text = capitalize(data[i].type);
        title.fixedX = title.x = offsetLeft + titleOffset;
        title.fixedY = title.y = data[i].fixedY - titleOffset;
        if (array.length == 0) {
            array.push(title);
        } else {
            if (array[array.length - 1].type != title.type) {
                array.push(title);
            }
        }
    }
    return array;
}

/*
    the data will be loaded into a 2D array
    this will merge 2D array into 1D
*/
function mergeResults(results) {
    var data = [];
    for (var i = 0; i < results.length; i++) {
        for (var j = 0; j < results[0].length; j++) {
            data.push(results[i][j]);
        }
    }
    return data;
}

/*
    calculate text width for drawing
*/
function textLength(text) {
    return text.toString().length * charWidth;
}

/*
    capitalize the first char of the given string
*/
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

