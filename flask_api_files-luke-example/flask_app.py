from pymongo import MongoClient
from flask import Flask
from flask_cors import CORS
from bson import ObjectId
import json

#solve objectID typeError with source: https://stackoverflow.com/questions/16586180/typeerror-objectid-is-not-json-serializable
class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

#create variable for the mongo client port
mongo = MongoClient(port=27017)

#create variable for the database
db = mongo["us_imports"]

#create variables for the collections
import_commodities = db["import_commodities"]
import_ports = db["import_ports"]
port_information = db["us_port_information"]

#pre-calculate port data for faster loading
def calculate_port(import_ports, port_information):
    # Build the aggregation pipeline for commodity value by port by month
    group_query = {'$group': {"_id": {"PORT_NAME": "$PORT_NAME",
                                    "PORT": "$PORT",
                                    "COMMODITY_ID": "$I_COMMODITY",
                                    "I_COMMODITY_SDESC": "$I_COMMODITY_SDESC",
                                    "MONTH": "$MONTH"},
                                    "total_value": {"$sum": {"$add": ["$GEN_VAL_MO"]}}
                            }
                    }
    # Create a match query that matches
    match_query = {"$match": {"total_value": {"$gt": 0},
                            #don't include total all countries which was in the dataset or data point which included the header info for some reason
                            "_id.PORT": {"$nin": ["-","PORT"]}
                            }
                    }

    # Create a dictionary that will allow the pipeline to sort by country in alphabetical order or integers in descending order using 1 or -1
    sort_values = {"$sort": {"_id.PORT_NAME": 1}}

    # Put the pipeline together
    pipeline = [group_query, match_query, sort_values]  

    # Run the pipeline through the aggregate method, cast the results as a list, and save the results to a variable
    query_results = list(import_ports.aggregate(pipeline))

    api_return = []

    for result in query_results:
        lat = list(port_information.find({"port_id":result["_id"]["PORT"]},{"lat": 1}))
        lon = list(port_information.find({"port_id":result["_id"]["PORT"]},{"lon": 1}))
        try:
            result["_id"]["LATITUDE"] = lat[0]["lat"]
            result["_id"]["LONGITUDE"] = lon[0]["lon"]
            api_return.append(result)
        except IndexError:
            result["_id"]["LATITUDE"] = 37.0902
            result["_id"]["LONGITUDE"] = -95.7129
            pass
    return api_return

#call calculate port function to pre-caclulate the api information for faster page loading
port_api = calculate_port(import_ports, port_information)

#pre-caclulate commodity data for faster loading
def calculate_commodity(import_commodities):
    # Build the aggregation pipeline for commodity value by country by month
    group_query = {'$group': {"_id": {"CTY_NAME": "$CTY_NAME",
                                    "CTY_CODE": "$CTY_CODE",
                                    "COMMODITY_ID": "$I_COMMODITY",
                                    "I_COMMODITY_SDESC": "$I_COMMODITY_SDESC",
                                    "GEN_VAL_MO": "$GEN_VAL_MO",
                                    "MONTH": "$MONTH"},
                            }
                    }
    # Create a match query that matches
    match_query = {"$match": {"_id.GEN_VAL_MO": {"$gt": 0},
                            #don't include total all countries which was in the dataset
                            "_id.CTY_CODE": {"$ne": "-"}
                            }
                    }

    # Create a dictionary that will allow the pipeline to sort by country in alphabetical order or integers in descending order using 1 or -1
    sort_values = {"$sort": {"_id.CTY_NAME": 1}}

    # Put the pipeline together
    pipeline = [group_query, match_query, sort_values]  

    # Run the pipeline through the aggregate method, cast the results as a list, and save the results to a variable
    query_results = list(import_commodities.aggregate(pipeline))

    return query_results

#create variable to store calculate commodity function to pre-caclulate the api information for faster page loading
commodity_api = calculate_commodity(import_commodities)

#pre-caclulate total country trade for faster loading
def calculate_country_trade(import_commodities):
    # Build the aggregation pipeline for total country value by month
    group_query = {'$group': {"_id": {"CTY_NAME": "$CTY_NAME",
                                    "CTY_CODE": "$CTY_CODE",
                                    "MONTH": "$MONTH"}, 
                                "total_value": {"$sum": {"$add": ["$GEN_VAL_MO"]}}
                            }
                    }
    # Create a match query that matches
    match_query = {"$match": {"total_value": {"$gt": 0},
                            #don't include total all countries which was in the dataset or data point which included the header info for some reason
                            "_id.CTY_CODE": {"$nin": ["-","CTY_CODE"]}
                            }
                    }

    # Create a dictionary that will allow the pipeline to sort by country in alphabetical order or integers in descending order using 1 or -1
    sort_values = {"$sort": {"_id.MONTH": 1}}

    # Put the pipeline together
    pipeline = [group_query, match_query, sort_values]  

    # Run the pipeline through the aggregate method, cast the results as a list, and save the results to a variable
    query_results = list(import_commodities.aggregate(pipeline))
    return query_results

#create variable to store calculate commodity function to pre-caclulate the api information for faster page loading
trade_api = calculate_country_trade(import_commodities)

#create variable for the Flask
app = Flask(__name__)
CORS(app)

@app.route("/")
def welcome():
    #List all available api routes.
    return (
        f"Available Routes:<br>"
        f"/api/v1.0/commoditybyport<br>"
        f"/api/v1.0/commoditybycountry<br>"
        f"/api/v1.0/totaltradebycountry"
    )

@app.route("/api/v1.0/commoditybyport")
def get_port_data():
    # Query commodity by port by month
    return JSONEncoder().encode(port_api)

@app.route("/api/v1.0/commoditybycountry")
def get_country_data():
    # Query commodity by country by month
    return JSONEncoder().encode(commodity_api)

@app.route("/api/v1.0/totaltradebycountry")
def get_trade_by_country():
    #Query country totals by month
    return JSONEncoder().encode(trade_api)

if __name__ == "__main__":
    app.run(debug=True)