import requests
import csv
import time

#from your_file.py import key
key=""

def main():
    #name files to write
    port_filename = "port_data.csv"
    item_filename = "item_data.csv"

    #variable for list of selected items from .csv file
    selected_items = get_select_items_list("../selected_items_resources/selected_items_list.csv")

    #months to retrieve data
    months = ["01","02","03","04","05","06","07","08","09","10","11","12"]

    #year to retrieve data
    year = "2022"

    #variable to store header for .csv file. due to sharing the function, make a [0,1] list and put the header information as a list in spot 1 
    port_header = ["",["PORT","PORT_NAME","AIR_VAL_MO","AIR_WGT_MO","VES_VAL_MO","VES_WGT_MO","GEN_VAL_MO","I_COMMODITY_LDESC","I_COMMODITY_SDESC","CTY_CODE","CTY_NAME","COMM_LVL","SUMMARY_LVL","I_COMMODITY","YEAR","MONTH"]]

    item_header = ["",["I_COMMODITY_LDESC","I_COMMODITY_SDESC","GEN_VAL_MO","AIR_VAL_MO","AIR_WGT_MO","VES_VAL_MO","VES_WGT_MO","CTY_CODE","CTY_NAME","COMM_LVL","SUMMARY_LVL","I_COMMODITY","YEAR","MONTH"]]
    
    #write headers to .csv file
    write_csv(port_filename, port_header)
    write_csv(item_filename, item_header)
    
    #record count to help keep track of progress
    record_count = 0

    #loop through months and selected items to retrieve data
    for month in months:
        for selected in selected_items:
            #calculate total calls required to help keep track of progress
            total_items = len(selected_items) * len(months)

            #create variable for api url
            port_url = f"https://api.census.gov/data/timeseries/intltrade/imports/porths?get=PORT,PORT_NAME,AIR_VAL_MO,AIR_WGT_MO,VES_VAL_MO,VES_WGT_MO,GEN_VAL_MO,I_COMMODITY_LDESC,I_COMMODITY_SDESC,CTY_CODE,CTY_NAME&COMM_LVL=HS6&SUMMARY_LVL=DET&I_COMMODITY={selected[0]}*&YEAR={year}&MONTH={month}&key={key}"
            item_url = f"https://api.census.gov/data/timeseries/intltrade/imports/hs?get=I_COMMODITY_LDESC,I_COMMODITY_SDESC,GEN_VAL_MO,AIR_VAL_MO,AIR_WGT_MO,VES_VAL_MO,VES_WGT_MO,CTY_CODE,CTY_NAME&COMM_LVL=HS6&SUMMARY_LVL=DET&I_COMMODITY={selected[0]}*&YEAR={year}&MONTH={month}&key={key}"

            #take it slow
            time.sleep(3)            
            
            #store data for ports
            port_data = get_url_data(port_url)

            #write data to .csv
            write_csv(port_filename, port_data)

            #take it slow
            time.sleep(3)

            #store data for items
            item_data = get_url_data(item_url)

            #write data to .csv
            write_csv(item_filename, item_data)

            #add to the record count and print progress
            record_count += 1
            print("completed",record_count,"of",total_items)

#function to read selected items .csv
def get_select_items_list(filepath):
    select_items_list = []
    with open(filepath, "r", newline="") as file:
        reader = csv.reader(file)
        for row in reader:
            select_items_list.append(row)
    return select_items_list

#function to write data .csv
def write_csv(filename, input_data):
    with open(filename, "a", newline="") as file:
        writer = csv.writer(file)
        for row in input_data[1:]:
            writer.writerow(row)

#retrieve port api data
def get_url_data(url):
    response = requests.get(url)
    #RequestsJSONDecodeError
    #JSONDecodeError
    try:
        return response.json()
    except ValueError:
        return ""

if __name__ == "__main__":
    main()