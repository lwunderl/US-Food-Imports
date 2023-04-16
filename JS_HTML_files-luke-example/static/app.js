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

    commodityMenu = commodityMenu.filter( function( item, index, inputArray ) {
        return inputArray.indexOf(item) == index;
    });
    commodityMenu = commodityMenu.sort();

    for (let i = 0; i < commodityMenu.length; i++) {
        commodityDropDown.append("option").text(commodityMenu[i]).property("value", commodityMenu[i])};

    let monthDropDown = d3.select("#selMonth");
    let monthMenu = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    for (let i = 0; i < monthMenu.length; i++) {
        monthDropDown.append("option").text(monthMenu[i]).property("value",i+1);
    }
    }


//prepare data for info panel
function infoPanel(data, currentMonth, currentCommodity) {
    let panelInfo = d3.select("#info-panel");
    panelInfo.text("");
    for (let i = 0; i < data.length; i++) {
        if (data[i]._id.MONTH == currentMonth && data[i]._id.I_COMMODITY_SDESC == currentCommodity) {
            panelInfo.append("tr").text(`${data[i]._id.CTY_NAME}: ${data[i]._id.GEN_VAL_MO}`);}
    }
}

//look at data
d3.json(commodityUrl).then(function (data){
    console.log(data);
    loadDropDowns(data)
});

function monthChanged(currentMonth) {
    currentCommodity = d3.select("#selCommodity option:checked").text()
    d3.json(commodityUrl).then(function (data){
        infoPanel(data, currentMonth, currentCommodity)

    });

}

function commodityChanged(currentCommodity) {
    currentMonth = d3.select("#selMonth option:checked").property("value")
    d3.json(commodityUrl).then(function (data){
        infoPanel(data, currentMonth, currentCommodity)

    });  
}


// d3.json(portUrl).then(function (data){
//     console.log(data);
// });

// d3.json(countryUrl).then(function (data){
//     console.log(data);
// });
