import re
import csv

#clean up copy and pasted codes from https://www.census.gov/foreign-trade/schedules/b/2022/imp-code.txt
def main():
    selected_items = get_selected_items("..\US-Food-Imports\selected_items.lnk.txt")
    write_select_items_list(selected_items)
    
#write csv for only HS6 level codes
def write_select_items_list(selected_items):
    with open("selected_items_list.csv","w", newline="") as file:
        writer = csv.writer(file)
        for _ in selected_items:
            writer.writerow([_])
    
#regex to filter for HS6 level codes in txt file
def get_selected_items(file_name):
    item_list = []
    with open(file_name, "r") as file:
        for row in file:
            if matches := re.search(r"^(\d{6})", row, re.IGNORECASE):
                HS6_code = matches.group(1)
                if HS6_code not in item_list:
                    item_list.append(HS6_code)
    return item_list

if __name__ == "__main__":
    main()