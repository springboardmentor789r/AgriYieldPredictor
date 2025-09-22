import pandas as pd
import joblib
from fastapi import FastAPI
from pydantic import BaseModel

# Load trained pipeline
pipeline = joblib.load("model.pkl")

app = FastAPI(title="Crop Yield Prediction API")


class YieldPrediction(BaseModel):
    Rainfall_mm__std: float
    Temperature_Celsius__std: float
    Days_to_Harvest__std: int
    Fertilizer_Used: float
    Irrigation_Used: float
    Region: str
    Soil_Type: str
    Crop: str
    Weather_Condition: str


@app.get("/health-check")
def health_check():
    return {"status": "working"}


@app.get("/get_crop_types")
def get_crop_types():
    return ["Barley", "Cotton", "Maize", "Rice", "Soybean", "Wheat"]

@app.get("/get_soil_types")
def get_soil_types():
    return ["Chalky", "Clay", "Loam", "Peaty", "Sandy", "Silt"]

@app.get("/get_weather_conditions")
def get_weather_conditions():
    return ["Cloudy", "Rainy", "Sunny"]

@app.get("/get_regions")
def get_regions():
    return ["East", "North", "South", "West"]


@app.post("/predict")
def predict(data: YieldPrediction):
    try:
        sample = pd.DataFrame([data.dict()])
        prediction = pipeline.predict(sample)[0]
        return {"predicted_yield": float(prediction)}
    except Exception as e:
        return {"error": str(e)}

