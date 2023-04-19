# US-Food-Imports

## Drawing Conclusions: Knowing the most consumed/imported selected food items along with their country of origin.

## Introduction/Objective
The purpose of this project is to explore US trade relationship with foreign countries and identify the most consumed selected items. Due to the complexity of the dataset, we will only be gathering data from the year 2020 for the selected food items.

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
What is the trade relationship between the US and other countries in the year 2020?
Where do the selected food items originate from?
What are the imported volumes and values of the selected food items?
what are amounts of the selected items imported or consumed monthly?

## Limitations
Huge Dataset, it took a longer than normal for the flask app to load.

## Instructions
<ol>
<li>Create an item list with guidance from https://www.census.gov/foreign-trade/schedules/b/2022/imp-code.txt. Copy and paste each line you wish to put in your dataset into selected_items.txt file. When your list is complete, run the selected_item_cleaner.py and it will produce a selected_items_list.csv. HS 10 digit numbers are aggregated datasets in the API where 10 digits is the most detailed and 2 is the least detailed. Your copied and pasted items will have the 10 digit HS number and selected_item_cleaner.py will create a list to the 6 digit level. selected_items_list.csv should be saved in the selected_items_resources directory</li>
<li>Run port_scraper.py to produce a dataset of port information including longitude and latitude in a created file port_info.csv in the api_resources directory. This file will require a key from https://www.geoapify.com/get-started-with-maps-api.</li>
<li>Run the api_data_caller.py to produce a dataset of import data by item and import data by port. These datasets will be created in item_data.csv and port_data.csv. You will need an api key from https://api.census.gov/data/key_signup.html</li>
<li>Run mongoDB. Use the mongoimport_instructions.txt to import the item_data.csv, port_data.csv, and port_info.csv into a mongoDB.</li>
<li>With mongoDB running, Run flask_final.py to serve the API</li>
<li>Copy the address to the index.html and paste it in the browser</li>
<li>Select data in the browser and explore</li>
</ol>

## Results

## Resources
https://stackoverflow.com/questions/16586180/typeerror-objectid-is-not-json-serializable
https://stackoverflow.com/questions/18008025/remove-duplicate-item-from-array-javascript
https://plotly.com/javascript/reference/choropleth/
https://plotly.com/javascript/reference/layout/
https://plotly.com/javascript/pie-charts/
https://getbootstrap.com/docs/5.3/getting-started/introduction/
https://www.mongodb.com/docs/manual/
https://flask-cors.readthedocs.io/en/latest/

## Contributing Members
Luke Wunderlin, Tyler Fowler, Kudrirat Abdulsalam, and Steffi Yang

## Data Sources
www.census.gov/data/developers/data-sets/international-trade.html
U.S. Census Bureau

