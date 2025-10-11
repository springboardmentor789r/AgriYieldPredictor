from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os
from typing import Optional

app = FastAPI(title="Crop Yield Prediction API",
              description="API for predicting crop yield based on environmental factors",
              version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request/response models
class PredictionInput(BaseModel):
    temperature: float
    rainfall: float
    humidity: float
    soil_type: str
    weather_condition: str
    crop_type: str

class PredictionResponse(BaseModel):
    predicted_yield: float

# Mock model (replace with your actual model loading)
# In a real application, you would load a pre-trained model here
# model = joblib.load('path_to_your_model.pkl')

def predict_yield(input_data: dict) -> float:
    """
    Mock prediction function.
    Replace this with your actual model prediction logic.
    """
    # This is a simple mock prediction
    base_yield = 5.0  # Base yield
    temp_factor = input_data['temperature'] * 0.01
    rainfall_factor = input_data['rainfall'] * 0.001
    humidity_factor = input_data['humidity'] * 0.01
    
    # Simple adjustments based on categories (in a real app, use one-hot encoding)
    soil_factors = {
        'Clay': 0.9,
        'Loamy': 1.1,
        'Peaty': 1.0,
        'Sandy': 0.8,
        'Silty': 1.05
    }
    
    weather_factors = {
        'Sunny': 1.0,
        'Rainy': 0.9,
        'Stormy': 0.7,
        'Cloudy': 0.95
    }
    
    crop_factors = {
        'Barley': 1.0,
        'Corn': 1.2,
        'Wheat': 0.9,
        'Soybeans': 1.1,
        'Rice': 1.3
    }
    
    prediction = base_yield * (1 + temp_factor + rainfall_factor + humidity_factor) * \
                 soil_factors.get(input_data['soil_type'], 1.0) * \
                 weather_factors.get(input_data['weather_condition'], 1.0) * \
                 crop_factors.get(input_data['crop_type'], 1.0)
    
    return round(prediction, 2)

@app.get("/")
async def root():
    return {"message": "Crop Yield Prediction API is running"}

@app.post("/predict", response_model=PredictionResponse)
async def predict_yield_endpoint(input_data: PredictionInput):
    try:
        # Convert input data to dict for processing
        input_dict = input_data.dict()
        
        # Get prediction (replace with actual model prediction)
        predicted_yield = predict_yield(input_dict)
        
        return {"predicted_yield": predicted_yield}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
