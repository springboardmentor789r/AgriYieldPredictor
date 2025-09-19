from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import pandas as pd
from utils import get_soil_types, get_crop_types, get_weather_conditions


class YieldInput(BaseModel):
    Crop_Type: str
    Soil_Type: str
    Weather_Condition: str
    Temperature: float
    Raifall: float     
    Humidity: float   

app = FastAPI(title="Agri Yield Predictor API")

@app.get("/crop_types")
def crop_types():
    return {"crop_types": get_crop_types()}

@app.get("/soil_types")
def soil_types():
    return {"soil_types": get_soil_types()}

@app.get("/weather_conditions")
def weather_conditions():
    return {"weather_conditions": get_weather_conditions()}  



# Load trained pipeline
with open("final_pipeline.pkl", "rb") as f:
    model = pickle.load(f)

@app.post("/predict_yield")
def predict_yield(data: YieldInput):

    input_df = pd.DataFrame([data.dict()])


    prediction = model.predict(input_df)[0]

    return {"predicted_yield": round(float(prediction), 3)}
