from bs4 import BeautifulSoup as soup
from splinter import Browser
import requests
import csv
import time
import re

#api key for geoapify, import from file as variable
key = ""

def main():

    #write header for csv file
    port_header = ["port_id", "port_name", "port_city", "port_state", "lat", "lon"]

    write_csv("port_info.csv", [port_header])
    #chrome browser from splinter
    browser = Browser("chrome")
    #list of states to loop through websites
    states = ["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"]
    #loop through each state webpage and scrape ports of entry tables
    for state in states:
        #website
        url = f"https://www.cbp.gov/contact/ports/{state}"
        #visit the website
        browser.visit(url)
        browser.is_element_present_by_css('div.list_text', wait_time=1)

        html = browser.html

        port_soup = soup(html, "html.parser")
        #get the cities, states, and names from site table
        port_cities = port_soup.find_all("span", class_=f"locality")
        port_states = port_soup.find_all("span", class_=f"administrative-area")
        port_names = port_soup.find_all("td", class_=f"views-field views-field-title")
        #loop through soup find_all to make list for csv rows
        for _ in range(len(port_cities)):
            port_list = []
            port_name = port_names[_].get_text()
            #get port id from name 
            port_id = get_port_id(port_name)
            port_city = port_cities[_].get_text()
            port_state = port_states[_].get_text()
            #slow it down
            time.sleep(1)
            #api call to get coordinates
            coordinates = get_coordinates(port_city, port_state, key)
            lat = coordinates[0]
            lon = coordinates[1]
            port_list.append([port_id, port_name, port_city, port_state, lat, lon])
            write_csv("port_info.csv", port_list)

#function to write data .csv
def write_csv(filename, input_data):
    with open(filename, "a", newline="") as file:
        writer = csv.writer(file)
        for row in input_data:
            writer.writerow(row)

#function to get coordinates
def get_coordinates(city, state, key):
    city = city
    state = state
    params = {
        "city": city,
        "state": state,
        "country": "United States of America",
        "apiKey": key
    }
    base_url = "https://api.geoapify.com/v1/geocode/search"
    response = requests.get(base_url, params=params).json()
    lon = response["features"][0]["geometry"]["coordinates"][0]
    lat = response["features"][0]["geometry"]["coordinates"][1]
    return [lat, lon]

#regex to filter for port id in port name
def get_port_id(port_name):
    try:
        if matches := re.search(r"(\d{4})", port_name, re.IGNORECASE):
            port_id = matches.group(1)
            return port_id
    except UnboundLocalError:
        return ""

if __name__ == "__main__":
    main()