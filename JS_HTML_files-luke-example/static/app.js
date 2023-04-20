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
            /*EXAMPLE:
            const price = 14340;

            // Format the price above to USD using the locale, style, and currency.
            let USDollar = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            });

            console.log(`The formated version of ${price} is ${USDollar.format(price)}`);
            // The formated version of 14340 is $14,340.00 */
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
        //console.log(choroplethNames);
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

// Create pie chart and port map
function createPieChart(data, currentMonth, currentCommodity) {
    let markers = []
    //prepare pie chart data
    portValues = []
    portLabels = []
    portLat = []
    portLong = []
    for (let i = 0; i < data.length; i++) {
        //optimize return and loading time. There's a better way, but I'm not sure how to yield a return
        if (data[i]._id.MONTH == currentMonth && data[i]._id.I_COMMODITY_SDESC == currentCommodity) {
            portLabels.push(data[i]._id.PORT_NAME);
            portValues.push(data[i].total_value);
            portLat.push(data[i]._id.LATITUDE);
            portLong.push(data[i]._id.LONGITUDE);
            }

            markers.push(
                L.circle([portLat,portLong], {
                    color: "",
                    fillColor: "red",
                    fillOpacity: .75,
                    // use general value as radius
                    radius: 10000
                }).bindPopup(
                    `<h4>${portLabels}</h4>`
                )
            )
        }        
        
        //console.log(portLat,portLong);
        //console.log(portValues);
        //console.log(portLabels)

    let pieChart = [{
        values: portValues,//.slice(0,10),
        labels: portLabels,//.slice(0,10),
        type: "pie"
      }];
      
    let pieLayout = {
        title:`Top Ten Ports of Entry for<br>${currentCommodity}<br>in MONTH ${currentMonth}`,
        height: 500,
        showlegend: false
      };
      
      Plotly.newPlot("pie", pieChart, pieLayout, {responsive: true});

      let markerLayer = L.layerGroup(markers);
    console.log(markerLayer)

    // Creating the map object 
    let myMap = L.map('marker', {
        center: [39.73, -104.99],
        zoom: 3,
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

    let overlayMaps = {
    "Ports": markerLayer,
    };

    L.control.layers(baseMaps,overlayMaps).addTo(myMap);

    const popup = L.popup();

    function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(myMap);
    };
    
    myMap.on('click', onMapClick);

};

// Chart JS
// NEED TO UPDATE. DOESN'T PARSE THROUGH SELECTION
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
        //Data changes but chart does not
        //console.log(monthArray)
        }
    }
    let yValues = Object.values(monthArray)
    let xValues = Object.keys(monthArray)

    const config = document.getElementById('chartId').getContext("2d");
    let myChart = new Chart (config, {
        type: 'bar',
        options: {
            plugins: {
                display: true,
            }
        },
        data: {
            labels: ["Jan", "Feb", "Mar"], //"Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
            datasets: 
            [{
                label: "Total Value ($) Millions",
                data: [1,2.3]
            }]
    }});

    myChart.destroy()

    // Create graph
    const path = document.getElementById('chartId').getContext("2d");
    myChart = new Chart (path, {
        type: 'bar',
        options: {
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
                backgroundColor: ['rgba(255,99,132,0.2)'],
                borderColor: ['rgba(255,99,132,1)'],
                borderWidth: 1,
                parsing: {
                    xAxisKey: xValues,
                    yAxisKey: yValues,
                }
            }]
        }
    })
};

//EXAMPLE to update chart
// https://www.youtube.com/watch?v=cPsyh_KuYNA
function updateChart(option){
    console.log(option.value);
    myChart.data.dataset[0].parsing.yAxisKey = `financial${option.value}`;
    myChart.update();
}

/*
    // Combine map data
    let sample_one = L.marker([portLat[0],portLong[0]]).bindPopup(`This is ${portNames[0]}`); 
*/
/*
function createMarkerChart (data, currentMonth, currentCommodity) {
    let markers = [];

    for (let i = 0; i < data.length; i++) {
        let monthNumber = data[i]._id.MONTH
        let commodityName = data[i]._id.I_COMMODITY_SDESC
        //console.log(commodityName);
        //optimize return and loading time. There's a better way, but I'm not sure how to yield a return
        if (monthNumber == currentMonth && commodityName == currentCommodity) { 
            portNames = data[i]._id.PORT_NAME;
            portLat = data[i]._id.LATITUDE;
            portLong = data[i]._id.LONGITUDE;

            markers.push(
                L.circle([portLat,portLong], {
                    color: "",
                    fillColor: "red",
                    fillOpacity: .75,
                    // use general value as radius
                    radius: 10000
                }).bindPopup(
                    `<h4>${portNames}</h4>`
                )
            )
        }        
        
    let markerLayer = L.layerGroup(markers);
    console.log(markerLayer)

    // Creating the map object 
    let myMap = L.map('marker', {
        center: [39.73, -104.99],
        zoom: 3,
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

    let overlayMaps = {
    "Ports": markerLayer,
    };

    L.control.layers(baseMaps,overlayMaps).addTo(myMap);

    const popup = L.popup();

    function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(myMap);
    };
    
    myMap.on('click', onMapClick);
    };
}
*/

//look at data
d3.json(commodityUrl).then(function (data){
    loadDropDowns(data)
    createBarGraph(data, "APPLES, FRESH")
    createChoropleth(data, 1, "APPLES, FRESH")
    infoPanel(data, 1, "APPLES, FRESH")
});

d3.json(portUrl).then(function (data){
    createPieChart(data, 1, "APPLES, FRESH")
    createMarkerChart(data, 1, "APPLES,FRESH")
});

function onChanged() {
    let currentCommodity = d3.select("#selCommodity option:checked").text();
    let currentMonth = d3.select("#selMonth option:checked").property("value");
    d3.json(commodityUrl).then(function (data){
        infoPanel(data, currentMonth, currentCommodity);
        createChoropleth(data, currentMonth, currentCommodity);
        createBarGraph(data, currentCommodity);
            //myChart.data.datasets.parsing.yAxisKey = `Object.values $(monthArray)`;
            //myChart.update();
    });          
    d3.json(portUrl).then(function (data){
        createPieChart(data, currentMonth, currentCommodity);
        createMarkerChart(data, currentMonth, currentCommodity)
    });
};

// d3.json(countryUrl).then(function (data){
//     console.log(data);
//});