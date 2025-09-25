from fastapi import FastAPI
from models.yieldprediction import YieldPrediction,Item
from typing import List
from utils import get_crop_type, get_soil_type, get_weather_condition
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
import os
import json
import pandas as pd
import joblib
pipeline=joblib.load("crop_yield_pipeline.pkl")
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return "working"

# @app.get("/something")
# def get_something():
#     return "this is a get request"

# @app.post("/")
# def post_req(name):
#     return f"hello {name}"

# @app.put("/")
# def put_req(name):
#     return f"hello {name}, this is a put request" 

# @app.delete("/")
# def delete_req():
#     return "hello, this is a delete request"

# @app.post("/predict")
# def predict(yield_prediction: YieldPrediction):
#     return f"Your temperature is{yield_prediction.temperature}, rainfall is {yield_prediction.rainfall} and soil type is {yield_prediction.soil_type}"

# @app.post("/items/post", response_model=Item)
# def create_item(item: Item):
#     return item

# # @app.get("/items/", response_model=List[Item])
# # def get_items():
# #     return [
# #         Item(id=1, name="Sample Item 1", price=10.5),
# #         Item(id=2, name="Sample Item 2", price=20.0)
# #     ]

# @app.get("/items/{item_id}", response_model=Item)
# def get_item(item_id: int):
#     if item_id == 1:
#         return Item(id=1, name="Sample Item 1", price=10.5)
#     elif item_id == 2:
#         return Item(id=2, name="Sample Item 2", price=20.0)
#     else:
#         raise HTTPException(status_code=404, detail="Item not found")

# @app.put("/items/{item_id}", response_model=Item)
# def update_item(item_id: int, updated_item: Item):
#     return updated_item

# @app.delete("/items/{item_id}")
# def delete_item(item_id: int):
#     return {"message": f"Item with id {item_id} deleted successfully "}

# 
@app.get("/crop_type")
def get_crop_types():
    return get_crop_type()

@app.get("/soil_type")
def get_soil_types():
    return get_soil_type()

@app.get("/weather_condition")
def get_weather_conditions():
    return get_weather_condition()

@app.post("/predict")
def predict(yieldPrediction: YieldPrediction):
    sample = pd.DataFrame([{
        'Region': yieldPrediction.region,                
        'soil_type': yieldPrediction.soil_type,         
        'Crop': yieldPrediction.crop_type,              
        'rainfall': yieldPrediction.rainfall_mm,          
        'temperature': yieldPrediction.temperature,      
        'Fertilizer_Used': yieldPrediction.fertilizer_used, 
        'Irrigation_Used': yieldPrediction.irrigation_used, 
        'weather_condition': yieldPrediction.weather_condition, 
        'Days_to_Harvest': yieldPrediction.days_to_harvest
    }])

    print("Sample Data:", sample)
    prediction = pipeline.predict(sample)[0]
    return {"predicted_yield": float(prediction)}
