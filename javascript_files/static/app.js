//create a variable for the API
const commodityUrl = "http://127.0.0.1:5000/api/v1.0/commoditybycountry";

const portUrl = "http://127.0.0.1:5000/api/v1.0/commoditybyport"

const countryUrl = "http://127.0.0.1:5000/api/v1.0/totaltradebycountry"

// Create dropdown menus
function loadDropDowns(data) {
    //populate drop down menu with for loop by using .append(<>html language</>) .text(<>your text</>) and .property("value", yourdatavalues)
    let commodityDropDown = d3.select("#selCommodity");
    let commodityMenu = [];
    for (let i = 0; i < data.length; i++) {
        commodityMenu.push(data[i]._id.I_COMMODITY_SDESC);
        };

    //filter array for duplicates https://stackoverflow.com/questions/18008025/remove-duplicate-item-from-array-javascript
    commodityMenu = commodityMenu.filter( function( item, index, inputArray ) {
        return inputArray.indexOf(item) == index;
    });
    commodityMenu = commodityMenu.sort();

    for (let i = 0; i < commodityMenu.length; i++) {
        commodityDropDown.append("option").text(commodityMenu[i]).property("value", commodityMenu[i]);}

    let monthDropDown = d3.select("#selMonth");
    let monthMenu = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    for (let i = 0; i < monthMenu.length; i++) {
        monthDropDown.append("option").text(monthMenu[i]).property("value",i+1);
    }
    }

//prepare data for info panel
function infoPanel(data, currentMonth, currentCommodity) {
    let panelInfo = d3.select("#info-panel");
    panelInfo.text("COUNTRY OF ORIGIN: VALUE OF IMPORTS");
    for (let i = 0; i < data.length; i++) {
        if (data[i]._id.MONTH == currentMonth && data[i]._id.I_COMMODITY_SDESC == currentCommodity) {
            panelInfo.append("tr").text(`${data[i]._id.CTY_NAME}: ${data[i]._id.GEN_VAL_MO}`);}
    }
}

// Create choropleth map
function createChoropleth(data, currentMonth, currentCommodity) {
    //prepare data for choropleth
    let choroplethNames = []
    let choroplethValues = []
    for (let i = 0; i < data.length; i++) {
        if (data[i]._id.MONTH == currentMonth && data[i]._id.I_COMMODITY_SDESC == currentCommodity) {
            choroplethNames.push(data[i]._id.CTY_NAME);
            choroplethValues.push(data[i]._id.GEN_VAL_MO);
        }
    }

    let countryLocations = [{
        type: 'choropleth',
        locationmode: "country names",
        locations: choroplethNames,
        z: choroplethValues,
        autocolorscale: false,
        colorscale: [
            [0,'rgb(252, 200, 1)'],[0.2,'rgb(252, 150, 1)'],
            [0.4,'rgb(252, 100, 1)'], [0.6,'rgb(252, 75, 1)'],
            [0.8,'rgb(252, 50, 1)'],[1,'rgb(252, 1, 1)']],
        colorbar: {len: .25}
    }];
    
    let choroplethLayout = {
        title: {
            text:`Country of Origin for<br>${currentCommodity} in MONTH ${currentMonth}`,
            automargin: true
        },
        geo:{
            projection:{
                type: "robinson"
            }
        },
        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 50,
        }
    };
    Plotly.newPlot("choropleth", countryLocations, choroplethLayout, {responsive:true});
}

// Create pie chart
function createPieChart(data, currentMonth, currentCommodity) {

    //prepare pie chart data
    portValues = []
    portLabels = []
    for (let i = 0; i < data.length; i++) {
        //optimize return and loading time. There's a better way, but I'm not sure how to yield a return
        if (data[i]._id.MONTH == currentMonth && data[i]._id.I_COMMODITY_SDESC == currentCommodity) {
            portLabels.push(data[i]._id.PORT_NAME);
            portValues.push(data[i].total_value);
            }
        };

    let pieChart = [{
        values: portValues,
        labels: portLabels,
        type: "pie"
      }];
      
    let pieLayout = {
        title:`Ports of Entry for<br>${currentCommodity}<br>in MONTH ${currentMonth}`,
        height: 500,
        showlegend: false
      };
      
      Plotly.newPlot("pie", pieChart, pieLayout, {responsive: true});
}

//function to return color based on depth variable
function getColor(d) {
    return d > 50000000 ? "rgb(252, 1, 1)" :
            d > 20000000 ? "rgb(252, 50, 1)" :
            d > 10000000 ? "rgb(252, 75, 1)" :
            d > 5000000 ? "rgb(252, 100, 1)" :
            d > 1000000 ? "rgb(252, 150, 1)" :
            "rgb(252, 200, 1)";
}

//create port map
function createMarkerChart(data, currentMonth, currentCommodity) {
    myMap.remove()
    //create layer for street map
    let streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // create array variable to store circles
    let portValues = [];

    //loop through dataFeatures and set variables for lat, lon, depth, and magnitude
    for (let i = 0; i < data.length; i++) {
        //create if statement variable to skip null
        let portFeature = data[i]._id;
        
        //create variables for building circles
        let portLat = portFeature.LATITUDE;
        let portLon = portFeature.LONGITUDE;
        let portName = portFeature.PORT_NAME;
        let portValue = data[i].total_value;

        //add to earthquakeEvents array with circle and pop-up information
        if (portFeature.MONTH == currentMonth && portFeature.I_COMMODITY_SDESC == currentCommodity) {
            if (portFeature){
                portValues.push(
                    L.circle([portLat, portLon], {
                        color: "",
                        fillColor: getColor(portValue),
                        fillOpacity: .75,
                        radius: 20000
                    }).bindPopup(
                        `<h4>${portName}</h4>
                        <p>Value of Imported ${currentCommodity}: ${portValue}</p>`
                        )
                );
            }
        }
    }

    //turn port values array into a layer
    ports = L.layerGroup(portValues);

    //create myMap variable
    myMap = L.map("marker", {
        center: [39.810492, -98.556061],
        zoom: 4,
        layers: [streetMap, ports]
    });
};

// Chart JS

// Create bar graph
function createBarGraph(data, currentCommodity) {
    
    let monthArray = {"January":0,"February":0,"March":0,"April":0,"May":0,"June":0,"July":0,"August":0,"September":0,"October":0,"November":0,"December":0};
    
    for (let i = 0; i < data.length; i++) {

        let monthNumber = data[i]._id.MONTH
        let totalValueMo = data[i]._id.GEN_VAL_MO
        let commodityName = data[i]._id.I_COMMODITY_SDESC

        if (commodityName == currentCommodity) {
            if (monthNumber == 1){
                monthArray.January += totalValueMo
            }
            else if (monthNumber == 2){
                monthArray.February += totalValueMo
            }
            else if (monthNumber == 3){
                monthArray.March += totalValueMo
            }
            else if (monthNumber == 4){
                monthArray.April += totalValueMo
            }
            else if (monthNumber == 5){
                monthArray.May += totalValueMo
            }
            else if (monthNumber == 6){
                monthArray.June += totalValueMo
            }
            else if (monthNumber == 7){
                monthArray.July += totalValueMo
            }
            else if (monthNumber == 8){
                monthArray.August += totalValueMo
            }
            else if (monthNumber == 9){
                monthArray.September += totalValueMo
            }
            else if (monthNumber == 10){
                monthArray.October += totalValueMo
            }
            else if (monthNumber == 11){
                monthArray.November += totalValueMo
            }
            else if (monthNumber == 12){
                monthArray.December += totalValueMo         
            }
        }
    }

     // based on answer here: https://stackoverflow.com/questions/40056555/destroy-chart-js-bar-graph-to-redraw-other-graph-in-same-canvas
    // JS - Destroy exiting Chart Instance to reuse <canvas> element
    // <canvas> id
    let chartStatus = Chart.getChart('bar'); 
    if (chartStatus != undefined) {
        chartStatus.destroy();
    }

    let yValues = Object.values(monthArray)
    let xValues = Object.keys(monthArray)

    let path = document.getElementById('bar').getContext("2d");
    myChart = new Chart (path, {
        type: 'bar',
        options: {
            animation: true,
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: [`Total USD ($) from January to December for:`, `${currentCommodity}`],
                    padding: {
                        top: 10,
                        bottom: 30},
                },
                legend: {
                    display: false},
            tooltip: {
                enabled: true},
            },
        },
        data: {
            labels: xValues,
            datasets: 
            [{
                label: "Total Value ($) Millions",
                data: yValues,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 205, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(201, 203, 207, 0.2)'
                ],
                borderColor: [                    
                    'rgb(255, 99, 132)',
                    'rgb(255, 159, 64)',
                    'rgb(255, 205, 86)',
                    'rgb(75, 192, 192)',
                    'rgb(54, 162, 235)',
                    'rgb(153, 102, 255)',
                    'rgb(201, 203, 207)'
            ],
                borderWidth: 1,
                parsing: {
                    xAxisKey: xValues,
                    yAxisKey: yValues,
                }
            }]
        }

    })

    myChart.update()
    
};

// initialize chart.js object for bar chart
let myChart = []
let myMap = L.map("marker");

//look at data
d3.json(commodityUrl).then(function (data){
    loadDropDowns(data)
    createBarGraph(data, "APPLES, FRESH")
    createChoropleth(data, 1, "APPLES, FRESH")
    infoPanel(data, 1, "APPLES, FRESH")
});

d3.json(portUrl).then(function (data){
    createPieChart(data, 1, "APPLES, FRESH")
    createMarkerChart(data, 1, "APPLES, FRESH")
});

function onChanged() {
    let currentCommodity = d3.select("#selCommodity option:checked").text();
    let currentMonth = d3.select("#selMonth option:checked").property("value");
    d3.json(commodityUrl).then(function (data){
        infoPanel(data, currentMonth, currentCommodity);
        createChoropleth(data, currentMonth, currentCommodity);
        createBarGraph(data, currentCommodity);
    });          
    d3.json(portUrl).then(function (data){
        createPieChart(data, currentMonth, currentCommodity);
        createMarkerChart(data, currentMonth, currentCommodity);
    });
};
