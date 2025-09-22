from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.YieldPrediction import YieldPrediction
from models.utils import get_weather_condition, get_crop_type, get_soil_type
import joblib
import pandas as pd

app = FastAPI(title="Crop Yield Prediction API", version="1.0.0")

# 🛡️ CORS setup for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📦 Load pipeline and encoders
pipeline = joblib.load("models/yield_pipeline.pkl")
soil_encoder = joblib.load("models/soil_encoder.pkl")
weather_encoder = joblib.load("models/weather_encoder.pkl")
crop_encoder = joblib.load("models/crop_encoder.pkl")

# 🩺 Health check
@app.get("/health-check")
def health_check():
    return {"status": "working"}

# 🌾 Get crop types
@app.get("/crop-types")
def get_crop_types():
    return get_crop_type()

# 🧱 Get soil types
@app.get("/soil-types")
def get_soil_types():
    return get_soil_type()

# 🌦️ Get weather conditions
@app.get("/weather-conditions")
def get_weather_conditions():
    return get_weather_condition()

# 📈 Predict crop yield
@app.post("/predict")
def predict_yield(sample: YieldPrediction):
    try:
        input_df = pd.DataFrame([{
            "Temperature": sample.Temperature,
            "Rainfall": sample.Rainfall,
            "Humidity": sample.Humidity,
            "Soil_Type": soil_encoder.transform([sample.Soil_Type.strip()])[0],
            "Weather_Condition": weather_encoder.transform([sample.Weather_Condition.strip()])[0],
            "Crop_Type": crop_encoder.transform([sample.Crop_Type.strip()])[0]
        }])

        prediction = pipeline.predict(input_df)[0]
        return {"predicted_yield": round(float(prediction), 2)}

    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}