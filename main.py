from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import pickle
from sklearn.pipeline import Pipeline
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    with open("pipeline.pkl", "rb") as f:
        pipeline = pickle.load(f)
except FileNotFoundError:
    print("Pipeline file not found. Training model first...")
    raise

class CropData(BaseModel):
    temperature: float
    rainfall: float
    humidity: float
    soilType: str
    weatherCondition: str
    cropType: str

@app.post("/predict")
async def predict_yield(crop_data: CropData):
    try:
        input_data = pd.DataFrame([{
            "temperature": crop_data.temperature,
            "rainfall": crop_data.rainfall,
            "humidity": crop_data.humidity,
            "soil_type": crop_data.soilType,
            "weather_condition": crop_data.weatherCondition,
            "crop_type": crop_data.cropType
        }])
        
        prediction = pipeline.predict(input_data)
        
        return {"prediction": float(prediction[0])}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Crop Yield Prediction API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)