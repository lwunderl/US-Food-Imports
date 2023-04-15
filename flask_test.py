import datetime as dt
import numpy as np
import pandas as pd
from pprint import pprint
from pymongo import MongoClient
from flask import Flask, json, jsonify


#################################################
# Database Setup
#################################################
mongo = MongoClient(port=27017)

db = mongo["us_imports" ]# Select the database
commodity = db["import_commodity"] # Select the collection
ports = db["import_ports"] # Select the collection

#################################################
# Flask Setup
#################################################
app = Flask(__name__)


#################################################
# Flask Routes
#################################################

@app.route("/")
def welcome():
    """List all available api routes."""
    return (    
        f"Available Routes:<br/>"
        f"/api/v1.0/commodity<br/>"
        f"/api/v1.0/ports<br/>"
        f"/api/v1.0/value"
    )


@app.route("/api/v1.0/ports")
def getPorts():
   
    # Number of ports by country name and numbers of times we trade with them in December 2022
    query = [{'$group': {'_id': "$CTY_NAME", 'count': {'$sum': 1}}}]
    results = list(ports.aggregate(query))
    print ("Number of countries in result: ", len(results))
    return json.dumps(results[0:25], default=str)
    

  


@app.route("/api/v1.0/commodity")
def getCommodity():
    
    # List items we purchase from other countries in December 2022
    query = [{'$group': {'_id': "$I_COMMODITY_LDESC", 'count': {'$sum': 1}}}]
    results = list(commodity.aggregate(query))
    print ("Number of commodities in result: ", len(results))
    return json.dumps(results, default=str)

    

@app.route("/api/v1.0/value")
def getAmount():
    group_query = {'$group': {'_id': {'CTY_NAME': '$CTY_NAME',
                                      'I_COMMODITY_LDESC': '$I_COMMODITY_LDESC',
                                      'GEN_VAL_MO': '$GEN_VAL_MO'},
                             'count': {'$sum': 1}}}
    match_query = {"$match": {'count': {'$gte': 10}}}
    sort_values = {'$sort': {'CTY_NAME': 1, 'count': -1}}
    pipeline = [group_query, match_query, sort_values]
    results = list(ports.aggregate(pipeline))
    count = 0
    output = []

    for result in results:
        count = count + 1
        output.append(result)
        if count > 20:
            break
    return json.dumps(output, default=str)
    #query = {}  

    #fields = {'CTY_NAME': "CANADA"} 

    #results = ports.find(query, fields)

    #count = 0
    #output = []
    
    #for result in results:
        #count = count + 1
        #output.append(result)
       # if count > 10:
            #break 
    #return jsonify(output)
    #return json.dumps(output, default=str) 

    


if __name__ == '__main__':
    app.run(debug=True)
    
    
    #print(db.list_collection_names())