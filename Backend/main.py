from fastapi import FastAPI, HTTPException
from utils import get_crop_type, get_soil_type, get_weather_condition
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
from datetime import timedelta

# Load models
pipeline = joblib.load("pipeline.pkl")              # single prediction model
model_multi = joblib.load("multivariate_model.pkl") # forecasting model

# Load dataset
df = pd.read_csv("crop_yield_dataset_extended_full.csv")
df["Date"] = pd.to_datetime(df["Date"])

# Separate numeric and non-numeric columns
numeric_cols = df.select_dtypes(include="number").columns.tolist()
non_numeric_cols = df.select_dtypes(exclude="number").columns.tolist()
if "Date" in non_numeric_cols:
    non_numeric_cols.remove("Date")

# Resample / aggregate: mean for numeric, first for non-numeric
df_resampled = df.groupby("Date").agg(
    {**{col: "mean" for col in numeric_cols},
     **{col: "first" for col in non_numeric_cols}}
).reset_index()

# Keep numeric columns for forecasting
exog_features = [
    "Soil_pH", "Temperature", "Humidity", "Wind_Speed",
    "N", "P", "K", "Soil_Quality"
]
exog = df_resampled[exog_features]
target_col = "Crop_Yield"

# Input schemas
class YieldPrediction(BaseModel):
    temperature: float
    rainfall: float
    humidity: float
    soil_type: str
    weather_condition: str
    crop_type: str

class ForecastRequest(BaseModel):
    date: str  # YYYY-MM-DD

# Initialize FastAPI
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
@app.get("/")
def check():
    return {"message": "Hello, this is the home page"}

@app.get("/crop-types")
def get_crop_types():
    return {"crop_types": get_crop_type()}

@app.get("/soil-types")
def get_soil_types():
    return {"soil_types": get_soil_type()}

@app.get("/weather-conditions")
def get_weather_conditions():
    return {"weather_conditions": get_weather_condition()}

# Single Prediction Endpoint
@app.post("/predict")
def predict(yieldPrediction: YieldPrediction):
    sample = pd.DataFrame([{
        "temperature": yieldPrediction.temperature,
        "rainfall": yieldPrediction.rainfall,
        "humidity": yieldPrediction.humidity,
        "soil_type": yieldPrediction.soil_type,
        "weather_condition": yieldPrediction.weather_condition,
        "crop_type": yieldPrediction.crop_type
    }])
    prediction = pipeline.predict(sample)
    return {"predicted_yield": float(prediction[0])}
@app.post("/forecast")
def forecast(request: ForecastRequest):
    try:
        user_date = pd.to_datetime(request.date)
        last_date = df_resampled["Date"].max()

        # --- Case A: User date inside dataset ---
        if user_date <= last_date:
            known_subset = df_resampled[df_resampled["Date"] >= user_date].head(7)

            if len(known_subset) == 7:
                df_out = known_subset[["Date", target_col]].rename(columns={target_col: "Yield"})
                df_out["Date"] = df_out["Date"].dt.strftime("%Y-%m-%d")
                return df_out.to_dict(orient="records")

            days_missing = 7 - len(known_subset)
            exog_future = exog.tail(days_missing)
            if len(exog_future) < days_missing:
                raise HTTPException(status_code=500,
                    detail=f"Not enough exog rows ({len(exog_future)}) for {days_missing} steps.")

            forecast_vals = model_multi.forecast(steps=days_missing, exog=exog_future)
            forecast_index = pd.date_range(start=last_date + timedelta(days=1), periods=days_missing, freq="D")

            forecast_df = pd.DataFrame({"Date": forecast_index, "Yield": forecast_vals})

            combined = pd.concat([
                known_subset[["Date", target_col]].rename(columns={target_col: "Yield"}),
                forecast_df
            ])
            combined["Date"] = combined["Date"].dt.strftime("%Y-%m-%d")
            return combined.to_dict(orient="records")

        # --- Case B: User date beyond dataset entirely ---
        else:
            steps_needed = (user_date - last_date).days + 7
            exog_future = exog.tail(steps_needed)
            if len(exog_future) < steps_needed:
                raise HTTPException(status_code=500,
                    detail=f"Not enough exog rows ({len(exog_future)}) for {steps_needed} steps.")

            forecast_vals = model_multi.forecast(steps=steps_needed, exog=exog_future)
            forecast_index = pd.date_range(start=last_date + timedelta(days=1), periods=steps_needed, freq="D")

            forecast_df = pd.DataFrame({"Date": forecast_index, "Yield": forecast_vals})
            subset = forecast_df[forecast_df["Date"] >= user_date].head(7)
            subset["Date"] = subset["Date"].dt.strftime("%Y-%m-%d")
            return subset.to_dict(orient="records")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast error: {str(e)}")
