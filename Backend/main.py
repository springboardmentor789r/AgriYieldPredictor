from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models.YieldPrediction import YieldPrediction
from utils import fetch_soil_types, fetch_crop_types, fetch_weather_conditions
import joblib
import pandas as pd

# Load ML pipeline once at startup
pipeline = joblib.load("yield_model_1.pkl")

app = FastAPI(title="FastAPI Demo", version="1.0.0")

# Enable CORS so the Vite + React frontend can call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health-check")
def health_check():
    return {"status": "working", "message": "Hello World"}

@app.get("/crop-types")
def get_crop_types():
    return {"crop_types": fetch_crop_types()}

@app.get("/soil-types")
def get_soil_types():
    return {"soil_types": fetch_soil_types()}

@app.get("/weather-conditions")
def get_weather_conditions():
    return {"weather_conditions": fetch_weather_conditions()}

@app.post("/predict")
def predict(yield_prediction:YieldPrediction):
    try:
        input_df = pd.DataFrame([yield_prediction.dict()])
        pred = pipeline.predict(input_df)[0]
        return {"status": "success", "predicted_yield": float(pred)}
    except Exception as e:
        # Optional: raise HTTPException for a proper 500 status
        raise HTTPException(status_code=500, detail=str(e))
