# fastapi_demo/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import pandas as pd
import os

# ==============================
# Pydantic Request Model
# ==============================
class PredictRequest(BaseModel):
    rainfall: float
    temperature: float
    days_to_harvest: int
    fertilizer_used: bool
    irrigation_used: bool
    region: str
    soil_type: str
    crop_type: str
    weather: str
    humidity: float | None = None   # Optional

# ==============================
# FastAPI App
# ==============================
app = FastAPI(title="Crop Yield API")

# Allow calls from dev frontend
origins = [
    "http://localhost:5173",  # Vite default
    "http://localhost:3000"   # CRA default
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# Load Trained Model Pipeline
# ==============================
pipeline = None
pipeline_path = os.path.join(os.path.dirname(__file__), "pipeline.pkl")

try:
    with open(pipeline_path, "rb") as f:
        pipeline = pickle.load(f)
    print("✅ Loaded pipeline.pkl")
except Exception as e:
    print("❌ Could not load pipeline.pkl:", e)

# ==============================
# Prediction Endpoint
# ==============================
@app.post("/predict")
def predict(req: PredictRequest):
    try:
        # Ensure input matches training pipeline schema
        X = pd.DataFrame([{
            "rainfall": float(req.rainfall),
            "temperature": float(req.temperature),
            "days_to_harvest": int(req.days_to_harvest),
            "fertilizer_used": int(req.fertilizer_used),   # bool → int
            "irrigation_used": int(req.irrigation_used),   # bool → int
            "humidity": float(req.humidity) if req.humidity is not None else 0.0,
            "region": req.region,
            "soil_type": req.soil_type,
            "crop_type": req.crop_type,
            "weather": req.weather
        }])

        if pipeline is None:
            raise RuntimeError("Model pipeline not loaded on server.")

        pred = pipeline.predict(X)  # must match pipeline feature names
        return {"predicted_yield": float(pred[0])}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
