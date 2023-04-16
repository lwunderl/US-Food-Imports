import datetime as dt
from pymongo import MongoClient
from bson import ObjectId
import json
from flask import Flask
from flask_cors import CORS


#################################################
# Database Setup
#################################################

mongo = MongoClient(port=27017)

db = mongo["us_imports" ]# Select the database
commodity = db["import_commodity"] # Select the collection
ports = db["import_ports"] # Select the collection
port_info = db["us_port_information"] # Select the collection

#################################################
# Flask Setup
#################################################
app = Flask(__name__)
CORS(app)

#################################################
# Flask Routes
#################################################
class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

  

@app.route("/")
def welcome():
    """List all available api routes."""
    return (    
        f"Available Routes:<br/>"
        f"/api/v1.0/commodity<br/>"
        f"/api/v1.0/country<br/>"
        f"/api/v1.0/valueByPort<br/>"
        f"/api/v1.0/valueByCountry<br/>"
        f"/api/v1.0/ValueByTrade"
    )


@app.route("/api/v1.0/country")
def getPorts():
   
    # List country name with how times we trade with them
    query = [{'$group': {'_id': "$CTY_NAME", 'count': {'$sum': 1}}}]
    results = list(ports.aggregate(query))
    print ("Number of countries in result: ", len(results))
    return JSONEncoder().encode(results)
    
    

  


@app.route("/api/v1.0/commodity")
def getCommodity():
    
    # List items imported and how many times
    query = [{'$group': {'_id': "$I_COMMODITY_LDESC", 'count': {'$sum': 1}}}]
    results = list(commodity.aggregate(query))
    print ("Number of commodities in result: ", len(results))
    return JSONEncoder().encode(results)
    

    

@app.route("/api/v1.0/valueByCountry")
def getValueCountry():
    # Query commodity contry by month
    group_query = {'$group': {'_id': {'COMMODITY_ID': '$I_COMMODITY',
                                      'CTY_CODE': '$CTY_CODE',
                                      'CTY_NAME': '$CTY_NAME',
                                      'I_COMMODITY_SDESC': '$I_COMMODITY_SDESC',
                                      'GEN_VAL_MO': '$GEN_VAL_MO',
                                      'MONTH': '$MONTH'},
                             }}
    # Sort in ascending order
    sort_values = {'$sort': {'_id.COMMODITY_ID': 1}}
    # Put the pipeline together
    pipeline = [group_query, sort_values]
    # Run the pipeline through aggregate method
    results = list(commodity.aggregate(pipeline))
    # Call less or equal to 50 records
    count = 0
    output = []

    for result in results:
        count = count + 1
        output.append(result)
        if count > 50:
            break
    return JSONEncoder().encode(output)
    #return json.dumps(output, default=str)

@app.route("/api/v1.0/valueByPort")
def getValuePort():
    # Query commodity by port by month
    group_query = {'$group': {"_id": {"PORT_NAME": "$PORT_NAME",
                                      "PORT": "$PORT",
                                      "COMMODITY_ID": "$I_COMMODITY",
                                      "I_COMMODITY_SDESC": "$I_COMMODITY_SDESC",
                                      "MONTH": "$MONTH"},
                                      "total_value": {"$sum":{"$add":["$GEN_VAL_MO"]}}}
                             }
    match_query = {"$match": {"total_value": {"$gt": 0}, "_id.PORT":{"$nin":["-","PORT"]}}}
    #
    sort_values = {'$sort': {'_id.PORT': 1}}
    pipeline = [group_query, match_query, sort_values]
    results = list(ports.aggregate(pipeline))
    
    count = 0
    output = []

    for result in results:
        count = count + 1
        output.append(result)
        if count > 50:
            break
    return JSONEncoder().encode(output)

@app.route("/api/v1.0/valueByTrade") 
def getTotalByTrade():
    group_query = {'$group': {"_id": {"CTY_NAME": "$CTY_NAME",
                                    "CTY_CODE": "$CTY_CODE",
                                    "MONTH": "$MONTH"}, 
                                "total_value": {"$sum": {"$add": ["$GEN_VAL_MO"]}}
                            }
                    }
    match_query = {"$match": {"total_value": {"$gt": 0}, 
                            "_id.CTY_CODE": {"$nin": ["-","CTY_CODE"]}
                            }
                    }
    # sort in ascending order
    sort_values = {"$sort": {"_id.MONTH": 1}}

    # Put the pipeline together
    pipeline = [group_query, match_query, sort_values]  

    # Run the pipeline through the aggregate method
    results = list(ports.aggregate(pipeline))
    count = 0
    output = []
    for result in results:
        count = count + 1
        output.append(result)
        if count > 50:
            break
    return JSONEncoder().encode(output)

    
 


if __name__ == '__main__':
    app.run(debug=True)
    
    
    