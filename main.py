import os
import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


AI_PROJECT_PATH = os.path.abspath("../AI PROJECT")  
MODEL_PATH = os.path.join(AI_PROJECT_PATH, "crop_yield_model_pipeline.pkl")


model = joblib.load(MODEL_PATH)

app = FastAPI(title="Crop Yield Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)

class CropInput(BaseModel):
    Temperature_C: float
    Rainfall_mm: float
    Humidity_pct: float
    Soil_Type: str
    Weather_Condition: str
    Crop_Type: str
    N_kg_per_ha: float
    P_kg_per_ha: float
    K_kg_per_ha: float
    Soil_pH: float
    Region: str

@app.get("/")
def root():
    return {"message": "Welcome to Crop Yield Prediction API"}

@app.get("/health")
def health_check():
    return {"status": True, "message": "API is healthy"}

@app.get("/soil_types")
def soil_types():
    return {"soil_types": ["Loamy", "Clay", "Silty", "Peaty", "Sandy"]}

@app.get("/weather_conditions")
def weather_conditions():
    return {"weather_conditions": ["Sunny", "Cloudy", "Rainy", "Stormy", "Windy"]}

@app.get("/crop_types")
def crop_types():
    return {"crop_types": ["Wheat", "Rice", "Corn", "Barley", "Millet", "Soybeans", "Cotton"]}

@app.post("/predict")
def predict_yield(data: CropInput):
   
    input_df = pd.DataFrame([data.dict()])

    prediction = model.predict(input_df)

    return {
        "crop": data.Crop_Type,
        "region": data.Region,
        "predicted_yield_tons_per_hectare": float(prediction[0])
    }