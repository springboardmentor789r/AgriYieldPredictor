from fastapi import FastAPI
from models.YieldPrediction import YieldPrediction
from utils import get_crop_type,get_soil_type,get_weather_condition
import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins (React frontend)
    allow_credentials=True,
    allow_methods=["*"],  # allow GET, POST, PUT, DELETE, OPTIONS
    allow_headers=["*"],
)


pipeline = joblib.load("pipeline.pkl")


@app.get('/health-check')
def health_check():
    return "Working"

@app.get("/crop-types")
def get_crop_types():
    return get_crop_type()

@app.get("/soil-types")
def get_soil_types():
    return get_soil_type()

@app.get("/weather-conditions")
def get_weather_conditions():
    return get_weather_condition()


@app.post("/predict")
def predict(yieldPrediction:YieldPrediction):
    sample = pd.DataFrame([{
        "crop_type":yieldPrediction.crop_type,
        "soil_type": yieldPrediction.soil_type,
        "weather_condition": yieldPrediction.weather_condition,
        "temperature": yieldPrediction.temperature,
        "rainfall": yieldPrediction.rainfall,
        "humidity": yieldPrediction.humidity
    }])
    prediction =pipeline.predict(sample)[0]
    return {"predicted_yield": prediction}

