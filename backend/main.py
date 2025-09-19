from fastapi import FastAPI
from models.YieldPrediction import YieldPrediction
from utils import get_weather_condition, get_crop_type, get_soil_type
import pandas as pd
import joblib
from fastapi.middleware.cors import CORSMiddleware

pipeline = joblib.load("final_yield_pipeline.pkl")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/health-check")
def health_check():
    return "Working"

@app.get("/crop_types")
def get_crop_types():
    return get_crop_type()

@app.get("/soil_types")
def get_soil_types():
    return get_soil_type()

@app.get("/weather_conditions")
def get_weather_conditions():
    return get_weather_condition()

@app.post("/predict")
def predict(yieldPrediction: YieldPrediction):
    sample = pd.DataFrame([yieldPrediction.dict()])
    prediction = pipeline.predict(sample)
    # Return the prediction as a float
    return {"predicted_yield": float(prediction[0])}