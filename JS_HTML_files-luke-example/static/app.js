//create a variable for the API
const commodityUrl = "http://127.0.0.1:5000/api/v1.0/commoditybycountry";

const portUrl = "http://127.0.0.1:5000/api/v1.0/commoditybyport"

const countryUrl = "http://127.0.0.1:5000/api/v1.0/totaltradebycountry"

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
    panelInfo.text("COUNTRY of ORIGIN: VALUE of IMPORTS");
    for (let i = 0; i < data.length; i++) {
        if (data[i]._id.MONTH == currentMonth && data[i]._id.I_COMMODITY_SDESC == currentCommodity) {
            panelInfo.append("tr").text(`${data[i]._id.CTY_NAME}: ${data[i]._id.GEN_VAL_MO}`);}
    }
}

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
}

function createBarGraph(data, currentCommodity) {

    let monthArray = {"January":0,"February":0,"March":0,"April":0,"May":0,"June":0,"July":0,"August":0,"September":0,"October":0,"November":0,"December":0};
    for (let i = 0; i < data.length; i++) {
        if (data[i]._id.I_COMMODITY_SDESC == currentCommodity) {
            if (data[i]._id.MONTH == 1){
                monthArray.January += data[i]._id.GEN_VAL_MO
            }
            else if (data[i]._id.MONTH == 2){
                monthArray.February += data[i]._id.GEN_VAL_MO
            }
            else if (data[i]._id.MONTH == 3){
                monthArray.March += data[i]._id.GEN_VAL_MO
            }
            else if (data[i]._id.MONTH == 4){
                monthArray.April += data[i]._id.GEN_VAL_MO
            }
            else if (data[i]._id.MONTH == 5){
                monthArray.May += data[i]._id.GEN_VAL_MO
            }
            else if (data[i]._id.MONTH == 6){
                monthArray.June += data[i]._id.GEN_VAL_MO
            }
            else if (data[i]._id.MONTH == 7){
                monthArray.July += data[i]._id.GEN_VAL_MO
            }
            else if (data[i]._id.MONTH == 8){
                monthArray.August += data[i]._id.GEN_VAL_MO
            }
            else if (data[i]._id.MONTH == 9){
                monthArray.September += data[i]._id.GEN_VAL_MO
            }
            else if (data[i]._id.MONTH == 10){
                monthArray.October += data[i]._id.GEN_VAL_MO
            }
            else if (data[i]._id.MONTH == 11){
                monthArray.November += data[i]._id.GEN_VAL_MO
            }
            else if (data[i]._id.MONTH == 12){
                monthArray.December += data[i]._id.GEN_VAL_MO         
            }

        }

    }

    let yValues = Object.values(monthArray)
    let xLabels = Object.keys(monthArray)

    // Chart JS
    // NEED TO UPDATE. DOESN'T PARSE THROUGH SELECTION

    let configuration = 0;
    const ctx = document.getElementById('chartId').getContext("2d");
    const myChart = new Chart (ctx, {
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
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
        datasets: 
        [{
            label: "Total Value ($) Millions",
            data: yValues,
            backgroundColor: ['rgba(255,99,132,0.2)'],
            borderColor: ['rgba(255,99,132,1)'],
            borderWidth: 1
        }]
      }
    });

    /* If the onchange = new Chart else don't change
    if (myChart) {
        myChart.destroy();
        myChart = new Chart(ctx, configuration);
    } else {
        myCharts = new Chart(ctx, configuration);
    }
    */
    
    //myChart.data.datasets[0].data = yValues;
    //myChart.update('active');
    //myChart.reset();
};


// Combine choropleth with amount of food $$ with port cities each with clickable layer

// Add choropleth map. then data later.
//prepare variables
/*portNames = []
portTotals = []
portLat = []
portLong = []

function createMarkerChart(data, currentMonth, currentCommodity) {
    for (let i = 0; i < data.length; i++) {
        //optimize return and loading time. There's a better way, but I'm not sure how to yield a return
        if (data[i]._id.MONTH == currentMonth && data[i]._id.I_COMMODITY_SDESC == currentCommodity) {
            portNames.push(data[i]._id.PORT_NAME);
            portTotals.push(data[i].total_value);
            portLat.push(data[i]._id.LATITUDE);
            portLong.push(data[i]._id.LONGITUDE);
            }
        }
    const groupLatLong = L.marker([portLat,portLong]).bindPopup(`This is ${portNames}`); */

// Example: var littleton = L.marker([39.61, -105.02]).bindPopup('This is Littleton, CO.'),
// L.layerGroup([littleton, denver, aurora, golden]);
    const alexandria = L.marker([44.336127, -75.917931]).bindPopup('Alexandra,NY');
    const anchorage = L.marker([61.2163129, -149.894852]).bindPopup('Anchorage,AL');
    const baltimore = L.marker([39.2908816, -76.610759]).bindPopup('Baltimore,MD');
    
    const groupLatLong = L.layerGroup(alexandria,anchorage,baltimore)

    const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 50,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'});
    
    const map = L.map('marker', {
        center: [39.73, -104.99],
        zoom: 10,
        layers: [osm, groupLatLong]
    });

    const streets = L.tileLayer('http://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}').addTo(map);

    const baseMaps = {
        "OpenStreetMap": osm,
        "WorldStreetMap": streets
    };

    const overlayMaps = {
        "Ports": groupLatLong,
        // Change data later
        "Choropleth": groupLatLong
    };

    const layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

    function onMapClick(e) {
        popup
            .setLatLng(e.latlng)
            .setContent("You clicked the map at " + e.latlng.toString())
            .openOn(map);
    }
        
    map.on('click', onMapClick);
    
    Plotly.newPlot("marker", {responsive: true});
//};

/*const circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(map);

const polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);

circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

const popup = L.popup()
    .setLatLng([51.513, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(map);
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
    });
    d3.json(portUrl).then(function (data){
        createPieChart(data, currentMonth, currentCommodity);
        //createMarkerChart(data, currentMonth, currentCommodity)
    });
}

// d3.json(countryUrl).then(function (data){
//     console.log(data);
// });