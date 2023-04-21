# US Food Imports

## Drawing Conclusions: Knowing the most consumed/imported selected food items along with their country of origin.

## Introduction/Objective
The purpose of this project is to explore US trade relationship with foreign countries and identify the most consumed selected items. Due to the complexity of the dataset, we will only be gathering data from the year 2022 for the selected food items.

## Method
Data Collation/Filteration, 
Data Exploration, 
Data Visualization


## Technology Used
Flask,
Pymongo,
MongoDB,
HTML/CSS,
JavaScript

## Questions Addressed
- What are the trade relationship between the US and other countries?
- Where do the selected food items originate from?
- What are the imported values(USD) of the selected food items?
- Which months(s) are the selected food items imported the most?

## Limitations
- Obtaining data from census.gov was much too large of a dataset which took longer than normal for the flask app to load.
- Learning Chart.js was a new charting/visualization tool and quite different compared to Plotly or Leaflet.

## Instructions
<ol>
<li>Create an item list with guidance from https://www.census.gov/foreign-trade/schedules/b/2022/imp-code.txt. Copy and paste each line you wish to put in your dataset into selected_items.txt file located in the selected_items_resources directory. When your list is complete, run the selected_item_cleaner.py and it will produce a selected_items_list.csv. HS 10 digit numbers are aggregated datasets in the API where 10 digits is the most detailed and 2 is the least detailed. Your copied and pasted items will have the 10 digit HS number and selected_item_cleaner.py will create a list to the 6 digit level. selected_items_list.csv should be saved in the selected_items_resources directory</li>
<li>Run port_scraper.py in the api_resources directory to produce a dataset of port information including longitude and latitude. The file created will be named port_info.csv. port_scraper.py will require a key from https://www.geoapify.com/get-started-with-maps-api.</li>
<li>Run the api_data_caller.py in the api_resources directory to produce two datasets which will contain import data by item and import data by port. These datasets will be created as item_data.csv and port_data.csv. You will need an api key from https://api.census.gov/data/key_signup.html</li>
<li>Run mongoDB. Use the mongoimport_instructions.txt to import the item_data.csv, port_data.csv, and port_info.csv into a mongoDB.</li>
<li>With mongoDB running, Run flask_final.py to serve the API</li>
<li>Copy the address to the index.html located in html_css_test and paste it in the browser</li>
<li>Select data on the site in the browser and explore</li>
</ol>

## Example
![image](https://user-images.githubusercontent.com/120594187/233515828-e6a2025f-4fec-4c4e-a961-49a5f076d7b9.png)


![image](https://user-images.githubusercontent.com/120594187/233515884-d43fe605-7846-4335-98c1-dfa1deffb958.png)


![image](https://user-images.githubusercontent.com/120594187/233515960-d5bd1cf2-63f6-4153-a1ee-6617ae700e55.png)



## Results
- The selected food items with the highest imported values were Bananas ($208M), Strawberries ($210M), and NESOI cheese ($144M).
- For the first half of the year (January-June), Bananas (Mar), Strawberries (Jan/Feb), and Processed Cheese (Mar) were the food items imported the most.
- For the second half of the year (July-December), Blue-veined Cheese (Sept), NESOI Cheese (Nov), and Tea (Sept) were the food items imported the most.


- The selected food items with the lowest imported values were Strawberries ($2M), Tea ($15M), and all categories of Cheese ($90M).
- For the first half of the year (January-June), Bananas (Jan) and all categories of Cheese (Feb) were the food items imported the least.
- For the second half of the year (July-December), Strawberries (Aug) and Tea (Dec) were the food items imported the least.

## Resources
- https://stackoverflow.com/questions/16586180/typeerror-objectid-is-not-json-serializable
- https://stackoverflow.com/questions/18008025/remove-duplicate-item-from-array-javascript
- https://plotly.com/javascript/reference/choropleth/ 
- https://plotly.com/javascript/reference/layout/
- https://plotly.com/javascript/pie-charts/
- https://getbootstrap.com/docs/5.3/getting-started/introduction/
- https://www.mongodb.com/docs/manual/
- https://flask-cors.readthedocs.io/en/latest/

## Contributing Members
Luke Wunderlin, Tyler Fowler, Kudrirat Abdulsalam, and Steffi Yang

## Data Sources
www.census.gov/data/developers/data-sets/international-trade.html
U.S. Census Bureau

