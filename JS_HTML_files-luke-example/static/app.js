//create a variable for the API
const commodityUrl = "http://127.0.0.1:5000/api/v1.0/commoditybycountry";

const portUrl = "http://127.0.0.1:5000/api/v1.0/commoditybyport"

const countryUrl = "http://127.0.0.1:5000/api/v1.0/totaltradebycountry"


//look at data
d3.json(commodityUrl).then(function (data){
    console.log(data);
});

d3.json(portUrl).then(function (data){
    console.log(data);
});

d3.json(countryUrl).then(function (data){
    console.log(data);
});