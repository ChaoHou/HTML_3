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
    initArray(teams, "yellow", "team", 0);

    var countries = [{ "text": "New Zealand" },
                    { "text": "Australia" }];
    initArray(countries, "aquamarine", "country", 1);

    var years = constructFromProperty(results, "year", null);

    initArray(years, "bisque", "year", 2);

    var graphs =
        [
            { "text": "Line chart" },
            { "text": "Bar chart" },
            { "text": "Pie chart" },
            { "text": "table" }
        ];
    initArray(graphs, "Green", "graph", 3);

    var venues = constructFromProperty(results, "venue", null);
    initArray(venues, "orange", "venue", 4);

    var data = teams.concat(countries, years, graphs, venues);
    height = calculateFixedPos(data) + groupGap + nodeHeight;

    var titleData = generateTitles(data);

    return [data,titleData];
    //render(data, titleData);
}

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

function initArray(data, color, type, group) {
    for (var i = 0; i < data.length; i++) {
        data[i].color = color;
        data[i].type = type;
        data[i].index = i;
        data[i].width = textLength(data[i].text);
        data[i].group = group;
    }
    return data;
}

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

function textLength(text) {
    return text.toString().length * charWidth;
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

