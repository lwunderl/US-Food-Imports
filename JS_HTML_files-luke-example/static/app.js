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
        };
        //console.log(portLat);

    let pieChart = [{
        values: portValues.slice(0,10),
        labels: portLabels.slice(0,10),
        type: "pie"
      }];
      
    let pieLayout = {
        title:`Top Ten Ports of Entry for<br>${currentCommodity}<br>in MONTH ${currentMonth}`,
        height: 500,
        showlegend: false
      };
      
      Plotly.newPlot("pie", pieChart, pieLayout, {responsive: true});

      // How to display each individual lat/long and corresponding label?
      let sample_one = L.marker([portLat[0],portLong[0]]).bindPopup(`${portLabels[0]}`);
      //console.log(sample_one);
  
    // Creating the map object 
    let myMap = L.map('marker', {
        center: [39.73, -104.99],
        zoom: 3,
        layers: []
    });

    //adding the tile layer
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
        "Ports": sample_one,
        // Change data later
        //"Choropleth": sample_one
    };

    let layerControl = L.control.layers(baseMaps,overlayMaps).addTo(myMap);

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

// Create for Chart for first option (data,1,"APPLES, FRESH")
// Display the default plot     

// On change to the DOM, call bar graph function
//d3.selectAll("#selCommodity").on("change", createBarGraph);

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

/*
function createMarkerChart(data, currentMonth, currentCommodity) {

    //prepare variables
    portNames = []
    portTotals = []
    portLat = []
    portLong = []

    for (let i = 0; i < data.length; i++) {

        let monthNumber = data[i]._id.MONTH
        let commodityName = data[i]._id.I_COMMODITY_SDESC
        //console.log(commodityName);

        //optimize return and loading time. There's a better way, but I'm not sure how to yield a return
        if (monthNumber == currentMonth && commodityName == currentCommodity) {
            portNames.push(data[i]._id.PORT_NAME);
            portTotals.push(data[i].total_value);
            //portLat.push(data[i]._id.LATITUDE);
            //portLong.push(data[i]._id.LONGITUDE);
            }
        };
        
        console.log(portNames)
        console.log(portTotals)        
        //console.log(portLat);
        //console.log(portLong);

    // Combine map data
    let sample_one = L.marker([portLat[0],portLong[0]]).bindPopup(`This is ${portNames[0]}`); 

    // Creating the map object 
    let myMap = L.map('marker', {
        center: [39.73, -104.99],
        zoom: 3,
        layers: []
    });

    //adding the tile layer
    let osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(myMap);

    // EXAMPLE:
    let alexandria = L.marker([44.336127, -75.917931]).bindPopup("Alexandria, NY");
    //let anchorage = L.marker([61.2163129, -149.894852]).bindPopup('Anchorage,AL');
    //let baltimore = L.marker([39.2908816, -76.610759]).bindPopup('Baltimore,MD');
    //groupLatLong = L.layerGroup(alexandria,anchorage,baltimore)

    let streets = L.tileLayer('http://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}').addTo(myMap); 

    let baseMaps = {
        //"OpenStreetMap": osm,
        "WorldStreetMap": streets
    };

    let overlayMaps = {
        "Ports": alexandria,
        // Change data later
        "Choropleth": alexandria
    };

    let layerControl = L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    /*let chorolayer;

    // Load the data and get the data w/ d3
    d3.json(portUrl).then(function(data) {

        // Create a new choropleth layer
        chorolayer = L.tileLayer(data, {

            // Define which property in the features to use
            _id: "GEN_VOL_MO",

            // Set the color scale
            scale: ["#ffffb2", "#b10026"],

            // The number of breaks in the step range
            steps: 10,

            // q for quartile, e for equidistant, k for k-means
            mode: "q",
            style: {
                // Border color
                color: "#fff",
                weight: 1,
                fillOpacity: 0.8
            },

            // Binding a popup to each layer
            onEachFeature: function(feature,layer) {
                layer.bindPopup("<strong" + feature.properties.CTY_NAME + "</strong><br /><br />$ GEN_VOL_MO: " + feature.properties.GEN_VAL_MO);
            }
        }).addTo(myMap);
    });

    // Set up the choropleth legend
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        let limits = chorolayer.options.limits;
        let colors = chorolayer.options.colors;
        let labels = [];

        // Add the minimum and maximum
        let legendInfo = "<h3>Percent National Obesity By State in 2015<br</h3>" +
        "<div class=\"labels\">" +
          "<div class=\"min\">" + limits[0] + "</div>" +
          "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
        "</div>";

        div.innerHTML = legendInfo;

        limits.forEach(function(limit,index) {
            labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };

    // Adding the choropleth legend to the map
    legend.addTo(myMap);

    const popup = L.popup();

    function onMapClick(e) {
        popup
            .setLatLng(e.latlng)
            .setContent("You clicked the map at " + e.latlng.toString())
            .openOn(myMap);
    };
        
    myMap.on('click', onMapClick);
};
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
    //createMarkerChart(data, 1, "APPLES,FRESH")
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
        //createMarkerChart(data, currentMonth, currentCommodity)
    });
};

// d3.json(countryUrl).then(function (data){
//     console.log(data);
//});