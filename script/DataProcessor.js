queue()
    .defer(loadData, "data/2008-Table1.csv", 2008)
    .defer(loadData, "data/2009-Table1.csv", 2009)
    .awaitAll(processData);

function processData(error, results) {
    console.log(results);
    var teams = [{ "text": "Adelaide Thunderbirds" },
              { "text": "Canterbury Tactix" },
              { "text": "Central Pulse" },
              { "text": "Melbourne Vixens" },
              { "text": "New South Wales Swifts" },
              { "text": "Northern Mystics" },
              { "text": "Queensland Firebirds" },
              { "text": "Southern Steel" },
              { "text": "Waikato Bay of Plenty Magic" },
              { "text": "West Coast Fever" }];
    initArray(teams, "yellow", "team", 0);

    var countries = [{ "text": "New Zealand" },
                    { "text": "Australia" }];
    initArray(countries, "aquamarine", "country", 1);

    var venues = [{ "text": "Adelaide Arena, Adelaide" },
                  { "text": "Arena Manawatu, Palmerston North" },
                  { "text": "Brisbane Convention and Exhibition Centre" },
                  { "text": "Challenge Stadium, Perth" },
                  { "text": "ETSA Park, Adelaide" },
                  { "text": "Energy Events Centre, Rotorua" },
                  { "text": "Hisense Arena, Melbourne" },
                  { "text": "Mystery Creek Events Centre, Hamilton" },
                  { "text": "North Shore Events Centre, Auckland" },
                  { "text": "Queen Elizabeth Youth Centre, Tauranga" },
                  { "text": "Stadium Southland, Invercargill" },
                  { "text": "State Netball and Hockey Centre, Melbourne" },
                  { "text": "Sydney Olympic Park Sports Centre" },
                  { "text": "TSB Bank Arena, Wellington" },
                  { "text": "Te Rauparaha Arena, Porirua" },
                  { "text": "The Edgar Centre, Dunedin" },
                  { "text": "Trusts Stadium, Auckland" },
                  { "text": "Westpac Arena, Christchurch" }];
    initArray(venues, "orange", "venue", 2);

    var years =
        [
            { "text": 2008 },
            { "text": 2009 },
            { "text": 2010 },
            { "text": 2011 },
            { "text": 2012 },
            { "text": 2013 }
        ];
    initArray(years, "bisque", "year", 3);

    var graphs =
        [
            { "text": "Line chart" },
            { "text": "Bar chart" },
            { "text": "Pie chart" },
            { "text": "table" }
        ];
    initArray(graphs, "Green", "graph", 4);

    var data = teams.concat(countries, venues, years, graphs);
    calculateFixedPos(data);

    var titleData = generateTitles(data);

    render(data, titleData);
}

function loadData(file, year, callback) {
    console.log(file);
    console.log(year);
    d3.csv(file,
        function (d) {
            return {
                year: year,
                round: d.Round,
                date: Date.parse(d.Date),
                time: new Date(d.Time),
                homeTeam: d["Home Team"],
                awayTeam: d["Away Team"],
                venue: d.Venue
            }
        },
        function (data) {
            console.log(data);
            callback(null, year);
        })

    
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

            var newWidth = x + array[i].width + nodeHeight / 2 + nodeGap
                            + array[i + 1].width + nodeHeight / 2 - offsetLeft;
            if (newWidth <= widthLimit) {
                x = x + array[i].width + nodeHeight / 2 + nodeGap;
            } else {
                x = offsetLeft;
                y = y + nodeGap + nodeHeight;
            }

        }

    }
}
