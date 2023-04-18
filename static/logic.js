// Reference Module 14 Homework
// What data do you want to use? --> MongoDB (usually SQLite) for database --> Flask to run each route/page --> Use js to create visualizations --> use html/css to put on web for interacting
// Place url in a constant variable
// Get the endpoint
// 

const url = "https://api.census.gov/data/timeseries/intltrade/imports/porths?get=PORT,PORT_NAME,AIR_VAL_MO,AIR_WGT_MO,VES_VAL_MO,VES_WGT_MO,GEN_VAL_MO,I_COMMODITY_LDESC,I_COMMODITY_SDESC,CTY_CODE,CTY_NAME&COMM_LVL=HS6&SUMMARY_LVL=DET&I_COMMODITY=080390*&YEAR=2022&MONTH=12";

// Fetch the JSON data and console log it
// Test this section in a separate .html file
d3.json(url).then(function(data) {
  console.log(data);
});

// Initialize the dashboard at start up 
function init() {

    // Use D3 to select the dropdown menu. Depends on Tyler's html
    let dropdownMenu = d3.select("#selDataset");

    // Use D3 to get sample names and populate the drop-down selector. 
    d3.json(url).then((data) => {
        
        // Set a variable for the sample names. Using I_COMMODITY? 
        let names = data.I_COMMODITY;

        // Add samples to dropdown menu
        names.forEach((id) => {

            // Log the value of id for each iteration of the loop
            console.log(id);

            dropdownMenu.append("option")
            .text(id)
            .property("value",id);
        });

        // Set the first sample from the list. Should the first sample from the list be [1]?
        let sample_one = names[0];

        // Log the value of sample_one
        console.log(sample_one);

        // Build the initial plots
        buildMetadata(sample_one);
        buildBarChart(sample_one);
        buildPieChart(sample_one);
        buildChoroChart(sample_one);

    });
};

// Function that populates metadata info
function buildMetadata(sample) {

    // Use D3 to retrieve all of the data
    d3.json(url).then((data) => {

        // Retrieve all metadata. Do we have to use a for loop?
        let metadata = data[0];

        // Filter based on the value of the sample
        let value = metadata.filter(result => result.id == sample);

        // Log the array of metadata objects after the have been filtered
        console.log(value)

        // Get the first index from the array
        let valueData = value[0];

        // Clear out metadata
        d3.select("#sample-metadata").html("");

        // Use Object.entries to add each key/value pair to the panel
        Object.entries(valueData).forEach(([key,value]) => {

            // Log the individual key/value pairs as they are being appended to the metadata panel
            console.log(key,value);

            d3.select("#sample-metadata").append("h5").text(`${key}: ${value}`);
        });
    });

};

// Function that builds the bar chart. Food over time in months
function buildBarChart(sample) {

    // Use D3 to retrieve all of the data
    d3.json(url).then((data) => {

        // Retrieve all sample data
        let sampleInfo = data.samples;

        // Filter based on the value of the sample
        let value = sampleInfo.filter(result => result.id == sample);

        // Get the first index from the array
        let valueData = value[0];

        // Get the I_COMMODITY ids and pop-up labels include total and description. Example: otu_ids, labels, and sample values
        // How separate the information by comma to isolate banana, etc
        let I_COMMODITY = valueData.otu_ids;
        let I_COMMODITY_LDESC = valueData.otu_labels;
        let MONTH = valueData.MONTH;

        // Log the data to the console
        console.log(I_COMMODITY,I_COMMODITY_LDESC,sample_values);

        // Set top ten items to display in descending order. xticks = data.MONTH, yticks = data.I_COMMODITY?
        // Do we need to slice or reverse?
        let yticks = I_COMMODITY.slice(0,10).map(id => `OTU ${id}`).reverse();
        let xticks = MONTH.slice(0,10).reverse();
        let labels = I_COMMODITY_LDESC.slice(0,10).reverse();
        
        // Set up the trace for the bar chart
        let trace = {
            x: xticks,
            y: yticks,
            text: labels,
            type: "bar",
            orientation: "h"
        };

        // Setup the layout
        let layout = {
            title: "US Food Imports Over Time"
        };

        // Call Plotly to plot the bar chart
        Plotly.newPlot("bar", [trace], layout)
    });
};

// Function that builds the Pie chart. Ports importing most food types. Gen_Vol_Mo and port_name
function buildPieChart(sample) {

    // Use D3 to retrieve all of the data
    d3.json(url).then((data) => {
        
        // Retrieve all sample data
        let sampleInfo = data.samples;

        // Filter based on the value of the sample
        let value = sampleInfo.filter(result => result.id == sample);

        // Get the first index from the array
        let valueData = value[0];

        // Get the labels. Example otu_ids, lables, and sample values
        let otu_ids = valueData.otu_ids;
        let otu_labels = valueData.otu_labels;
        let sample_values = valueData.sample_values;

        // Log the data to the console
        console.log(otu_ids,otu_labels,sample_values);
        
        // Change parameters for pie chart. Set up the trace for bubble chart
        let trace1 = {
            x: otu_ids,
            y: sample_values,
            text: otu_labels,
            mode: "markers",
            marker: {
                size: sample_values,
                color: otu_ids,
                colorscale: "Earth"
            }
        };

        // Set up the layout
        let layout = {
            title: "Bacteria Per Sample",
            hovermode: "closest",
            xaxis: {title: "OTU ID"},
        };

        // Call Plotly to plot the bubble chart
        //Plotly.newPlot("pie", [trace1], layout)
    });
};


//Reference 15.2.4 
// Function that builds choropleth map. Choropleth shows location of total food imports? Example % obesity per state.
//Creating the map object
// Will need port lat/long
let myMap = L.map("map", {
    center:[40,50],
    zoom:10});

function buildChoroChart(sample) {
    //Adding the tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(myMap)};

    //Fetch the JSON data and console log it. Get the data with d3.
    d3.json(port_url).then(function(data) {
        //console.log(response);
        //Create a new choropleth layer.
        foods = L.choropleth(data, {

        // which value? Define which property in the features to use.
        valueProperty: "Obesity",

        // Set the color scale.
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
        onEachFeature: function(feature, layer) {
        layer.bindPopup("<strong>" + feature.properties.NAME + "</strong><br /><br />% Obesity: " + feature.properties.Obesity);
        }
    }).addTo(myMap);

    // Set up the legend.
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        let limits = geojson.options.limits;
        let colors = geojson.options.colors;
        let labels = [];

        // Add the minimum and maximum.
        let legendInfo = "<h1>Percent National Obesity By State in 2015<br</h1>" +
        "<div class=\"labels\">" +
            "<div class=\"min\">" + limits[0] + "</div>" +
            "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
        "</div>";

        div.innerHTML = legendInfo;

        limits.forEach(function(limit, index) {
        labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };

    // Call Plotly to plot the bubble chart
    Plotly.newPlot("choro", [trace1], layout)
});

    // Adding the legend to the map
    legend.addTo(myMap);

// Function that updates dashboard when sample is changed
function optionChanged(value) { 

    // Log the new value
    console.log(value); 

    // Call all functions 
    buildMetadata(value);
    buildBarChart(value);
    buildPieChart(value);
    buildChoroChart(value);
};

// Call the initialize function
init();