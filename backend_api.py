from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import joblib


# Load trained pipeline

try:
    pipeline = joblib.load("final_yield_pipeline.pkl")
except Exception as e:
    pipeline = None
    print("⚠️ Model not loaded:", e)


# Initialize FastAPI app

app = FastAPI(
    title="AgriYield Prediction API",
    description="🌾 Predict crop yield based on weather, soil, and crop type",
    version="1.0"
)


# Request schema

class YieldPrediction(BaseModel):
    temperature: float
    rainfall: float
    humidity: float
    soil_type: str
    weather_condition: str
    crop_type: str



# Root endpoint

@app.get("/")
def root():
    return {
        "message": "🌱 Welcome to AgriYield Prediction API",
        "docs_url": "/docs",
        "health_check": "/health-check",
        "predict_endpoint": "/predict"
    }



# Health check

@app.get("/health-check")
def health_check():
    return {"status": "working", "model_loaded": pipeline is not None}



# Model info

@app.get("/model-info")
def model_info():
    if pipeline is None:
        raise HTTPException(status_code=500, detail="Model pipeline not loaded")
    return {
        "model_type": type(pipeline).__name__,
        "expected_features": ["temperature", "rainfall", "humidity", "soil_type", "weather_condition", "crop_type"]
    }



# Crop types (static list)

@app.get("/crop_types")
def get_crop_types():
    return {"crop_types": ["Rice", "Wheat", "Maize", "Cotton", "Sugarcane"]}



# Soil types (static list)

@app.get("/soil_types")
def get_soil_types():
    return {"soil_types": ["Sandy", "Loamy", "Peaty", "Clay", "Silty"]}



# Weather conditions (static list)

@app.get("/weather_conditions")
def get_weather_conditions():
    return {"weather_conditions": ["Sunny", "Rainy", "Cloudy", "Stormy"]}



# Prediction Endpoint

@app.post("/predict")
def predict(yieldPrediction: YieldPrediction):
    if pipeline is None:
        raise HTTPException(status_code=500, detail="Model pipeline not loaded")

    try:
        # Convert input into DataFrame
        sample = pd.DataFrame([yieldPrediction.dict()])

        # Run prediction
        prediction = pipeline.predict(sample)[0]

        return {
            "inputs": yieldPrediction.dict(),
            "predicted_yield": float(prediction),
            "note": "This is an estimated yield prediction based on input conditions."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
