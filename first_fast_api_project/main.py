from fastapi import FastAPI
from models.yieldprediction import YieldPrediction,Item
from typing import List
from utils import get_crop_type, get_soil_type, get_weather_condition
from fastapi.middleware.cors import CORSMiddleware
from statsmodels.tsa.statespace.sarimax import SARIMAXResults
from fastapi import HTTPException
import numpy as np  
import os
import json
import pandas as pd
import joblib
pipeline=joblib.load("crop_yield_pipeline.pkl")

sarimax_model = SARIMAXResults.load("sarimax_model2.pkl")
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

def generate_synthetic_exog(df: pd.DataFrame, steps: int):
    exog_columns = df.drop(columns=["Crop_Yield"]).columns.tolist()
    historical_exog = df[exog_columns].values
    n_features = historical_exog.shape[1]
    synthetic_data = []

    for _ in range(steps):
        base_row = historical_exog[np.random.randint(0, len(historical_exog))]
        noise = np.random.normal(0, 0.02, size=n_features)
        if np.random.rand() < 0.2:
            noise += np.random.normal(0, 0.1, size=n_features)
        synthetic_row = base_row + noise
        synthetic_data.append(synthetic_row)

    last_date = df.index[-1]
    future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1),
                                 periods=steps, freq="D")
    return pd.DataFrame(synthetic_data, columns=exog_columns, index=future_dates)

# ----------------------------
# Forecast endpoint
# ----------------------------
@app.get("/forecast")
def forecast(steps: int = 10):
    try:
        # Load dataset and preprocess
        df = pd.read_csv("crop_yield_dataset.csv", parse_dates=["Date"])
        df['Date'] = pd.to_datetime(df['Date'])
        df.set_index("Date", inplace=True)
        df = df.select_dtypes(include="number")
        df = df.groupby(df.index).mean()
        df = df.asfreq("D").interpolate(method="time")

        # Generate synthetic exogenous data
        future_exog = generate_synthetic_exog(df, steps)

        # Forecast using SARIMAX
        forecast_res = sarimax_model.get_forecast(steps=steps, exog=future_exog)
        forecast_mean = forecast_res.predicted_mean.tolist()
        conf_int = forecast_res.conf_int().values.tolist()

        return {
            "steps": steps,
            "forecast": forecast_mean,
            "confidence_interval": conf_int
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast error: {str(e)}")