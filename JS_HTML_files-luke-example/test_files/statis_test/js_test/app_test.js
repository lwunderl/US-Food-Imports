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
        let commodityDesc = data[i]._id.I_COMMODITY_SDESC
        commodityMenu.push(commodityDesc);
        };

    //filter array for duplicates https://stackoverflow.com/questions/18008025/remove-duplicate-item-from-array-javascript
    commodityMenu = commodityMenu.filter( function( item, index, inputArray ) {
        return inputArray.indexOf(item) == index;
    });

    // sort
    commodityMenu = commodityMenu.sort();
    
    // for loop to for the dropdown menu
    for (let i = 0; i < commodityMenu.length; i++) {
        commodityDropDown.append("option").text(commodityMenu[i]).property("value", commodityMenu[i]);}


    //For loop for the month menu
    let monthDropDown = d3.select("#selMonth");
    let monthMenu = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        for (let i = 0; i < monthMenu.length; i++) {
            monthDropDown.append("option").text(monthMenu[i]).property("value",i+1);
        }
};

 
//prepare data for info panel
function infoPanel(data, currentMonth, currentCommodity) {
    let panelInfo = d3.select("#info-panel");
    panelInfo.text("COUNTRY OF ORIGIN: VALUE OF IMPORTS");

    for (let i = 0; i < data.length; i++) {
        let commodityDesc = data[i]._id.I_COMMODITY_SDESC
        let monthNumber = data[i]._id.MONTH

        if (monthNumber == currentMonth && commodityDesc == currentCommodity) {

            // Add country name and monthly general values
            panelInfo.append("tr").text(`${data[i]._id.CTY_NAME}: ${data[i]._id.GEN_VAL_MO}`);}
    }
}


// Create pie chart
function createPieChart(data, currentMonth, currentCommodity) {
    
    //prepare pie chart data
    portLabels = []
    portValues = []

    for (let i = 0; i < data.length; i++) {
        let monthNumber = data[i]._id.MONTH
        let commodityName = data[i]._id.I_COMMODITY_SDESC
        let allPortNames = data[i]._id.PORT_NAME
        let allTotalValues= data[i].total_value

        //optimize return and loading time. There's a better way, but I'm not sure how to yield a return
        if (monthNumber == currentMonth && commodityName == currentCommodity) {
            portLabels.push(allPortNames);
            portValues.push(allTotalValues);
            }
    }

    let pieChart = [{
        values: portValues.slice(0,10),
        labels: portLabels.slice(0,10),
        type: "pie"
      }];
      
    let pieLayout = {
        title:`Top Ten Ports of Entry for:<br>${currentCommodity}<br> MONTH: ${currentMonth}`,
        height: 500,
        showlegend: false
      };
      
    Plotly.newPlot("pie", pieChart, pieLayout, {responsive: true});
};



// Create map
function createMapChart(data, currentMonth, currentCommodity) {
    // Creating the map object 
    let myMap = L.map('map', {
        center: [39.73, -104.99],
        zoom: 2,
        layers: []
        });
    
    let streets = L.tileLayer('http://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}').addTo(myMap); 

    let osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(myMap);

    let baseMaps = {
    "WorldStreetMap": streets,
    "OpenStreetMap": osm
    };
    
    // Click on map to see lat lon
    const popup = L.popup();

    function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(myMap);
    };
    
    myMap.on('click', onMapClick);
    
    //create array variable to store the circles
    let markersEvents = [];

    // Loop through the data and set variables for lat, lon, name
    for (let i = 0; i < data.length; i++) {
        let locationFeature = data[i]._id;

        // Create variables for building circles
        let monthNumber = data[i]._id.MONTH
        let commodityName = data[i]._id.I_COMMODITY_SDESC

        let portName = data[i]._id.PORT_NAME
        let portLat = data[i]._id.LATITUDE
        let portLon = data[i]._id.LONGITUDE

        
        if (locationFeature) {
            // THIS DOES NOT WORK EITHER!
            //if (monthNumber == currentMonth && commodityName == currentCommodity) {
                markersEvents.push(
                    L.circle([portLat,portLon], {
                        color: "red",
                        fillColor: "red",
                        fillOpacity: .75,
                        radius: 10000 
                    }).bindPopup(
                        `<h4>${portName}</h4>`
                    )
                )
            //}
        }
        //console.log(locationFeature)

        /* THIS WORKS!
        //if (monthNumber == currentMonth && commodityName == currentCommodity) {
            if (locationFeature) {
                markersEvents.push(
                    L.circle([portLat,portLon], {
                        color: "red",
                        fillColor: "red",
                        fillOpacity: .75,
                        radius: 10000 
                    }).bindPopup(
                        `<h4>${portName}</h4>`
                    )
                );
            }
        
        } */
        //console.log(portLabels, portLat, portLon)
    }

    let markers = L.layerGroup(markersEvents);

    let overlayMaps = {
        "Ports": markers,
        };
    
    L.control.layers(baseMaps,overlayMaps).addTo(myMap);
};


// initialize chart object to null
let myChart = null;

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

    let yValues = Object.values(monthArray)
    let xValues = Object.keys(monthArray)

    let path = document.getElementById('bar').getContext("2d");
    myChart = new Chart (path, {
        type: 'bar',
        options: {
            animation: true,
            response: true,
            plugins: {
                title: {
                    display: true,
                    text: `Total USD ($) for Imported Food Item Over Time: ${currentCommodity}`,
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
            labels: xValues, //["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
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
                    // Example: financials.cost
                    yAxisKey: yValues,
                }
            }]
        }

    })

    console.log(myChart)

    myChart.update()
    
};

//look at first set of data
d3.json(commodityUrl).then(function (data){
    loadDropDowns(data)
    infoPanel(data, 1, "APPLES, FRESH")
    createBarGraph(data, "APPLES, FRESH")
});

d3.json(portUrl).then(function (data){
    createPieChart(data, 1, "APPLES, FRESH"),
    createMapChart(data, "APPLES, FRESH")
});

function onChanged() {
    let currentCommodity = d3.select("#selCommodity option:checked").text();
    let currentMonth = d3.select("#selMonth option:checked").property("value");

    d3.json(commodityUrl).then(function (data){
        infoPanel(data, currentMonth, currentCommodity);
        createBarGraph(data, currentCommodity);
    });          
    d3.json(portUrl).then(function (data){
        createPieChart(data, currentMonth, currentCommodity);
        createMapChart(data,currentMonth, currentCommodity)
    });
};


// d3.json(countryUrl).then(function (data){
//     console.log(data);
//});