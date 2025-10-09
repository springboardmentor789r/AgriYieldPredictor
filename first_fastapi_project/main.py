from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import timedelta
from fastapi import Query
from models.YieldPrediction import YieldPrediction
from models.utils import get_weather_condition, get_crop_type, get_soil_type
import joblib
import pandas as pd

app = FastAPI(title="Crop Yield Prediction API", version="1.0.0")

# ---------------- CORS setup ----------------
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

# ---------------- Load encoders and pipeline ----------------
pipeline = joblib.load("models/yield_pipeline.pkl")
soil_encoder = joblib.load("models/soil_encoder.pkl")
weather_encoder = joblib.load("models/weather_encoder.pkl")
crop_encoder = joblib.load("models/crop_encoder.pkl")

# ---------------- Forecast CSV path ----------------
FORECAST_CSV = "timeseries/timeseries/forecast_next2months.csv"

try:
    forecast_df = pd.read_csv(FORECAST_CSV, parse_dates=['Date'])
    forecast_df.set_index('Date', inplace=True)
    print(f"✅ Loaded forecast CSV with {len(forecast_df)} rows")
except FileNotFoundError:
    print(f"⚠ Forecast CSV not found at {FORECAST_CSV}")
    forecast_df = None

# ---------------- Health Check ----------------
@app.get("/health-check")
def health_check():
    return {"status": "working"}

# ---------------- Metadata endpoints ----------------
@app.get("/crop-types")
def get_crop_types():
    return get_crop_type()

@app.get("/soil-types")
def get_soil_types():
    return get_soil_type()

@app.get("/weather-conditions")
def get_weather_conditions():
    return get_weather_condition()

# ---------------- Yield prediction endpoint ----------------
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
@app.get("/forecast/7days", summary="Get 7-day crop yield forecast from a start date")
def forecast_7days(start_date: str = Query(..., description="Start date in YYYY-MM-DD format")):
    try:
        start = pd.to_datetime(start_date)
    except:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")
    
    end = start + timedelta(days=6)  # 7 days including start
    forecast_start = forecast_df.index.min()
    forecast_end = forecast_df.index.max()
    
    # Check if requested range is within the forecast range
    if start < forecast_start or end > forecast_end:
        raise HTTPException(
            status_code=400,
            detail=f"Requested date range is out of forecast range ({forecast_start.date()} to {forecast_end.date()})"
        )
    
    # Slice the forecast
    forecast_slice = forecast_df.loc[start:end].copy()
    forecast_slice.reset_index(inplace=True)
    forecast_slice['Date'] = forecast_slice['Date'].dt.strftime('%Y-%m-%d')
    
    return JSONResponse(content={
        "start_date": start.strftime('%Y-%m-%d'),
        "end_date": end.strftime('%Y-%m-%d'),
        "forecast": forecast_slice.to_dict(orient='records')
    })