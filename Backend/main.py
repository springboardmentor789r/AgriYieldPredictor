from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import pickle

# -----------------------------
# Request Schemas
# -----------------------------
class YieldPrediction(BaseModel):
    temperature: float
    humidity: float
    rainfall: float
    soil_type: str
    crop_type: str
    weather_condition: str

class ForecastPrediction(BaseModel):
    Date: str   # Start date for forecasting (DD-MM-YYYY)

# -----------------------------
# Load Models
# -----------------------------
try:
    # Load point prediction model
    with open("yield_model_1.pkl", "rb") as f:
        yield_model = pickle.load(f)

    # Load SARIMAX forecast model
    with open("forecast_model.pkl", "rb") as f:
        data = pickle.load(f)
    sarimax_model = data["model"]
    exog_columns = data["exog_columns"]

except Exception as e:
    raise RuntimeError(f"❌ Failed to load models: {e}")

# -----------------------------
# FastAPI Config
# -----------------------------
app = FastAPI(title="Crop Yield API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# 1️⃣ Point Prediction
# -----------------------------
@app.post("/predict")
def predict_yield(data: YieldPrediction):
    try:
        input_df = pd.DataFrame([data.dict()])
        pred = yield_model.predict(input_df)[0]
        return {"status": "success", "predicted_yield": float(pred)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# 2️⃣ Forecast Prediction
# -----------------------------
@app.post("/forecast")
def forecast_yield(data: ForecastPrediction):
    try:
        # Convert user-provided date
        user_date = pd.to_datetime(data.Date, format="%d-%m-%Y")

        # Forecast horizon
        forecast_horizon = 10
        future_dates = pd.date_range(start=user_date, periods=forecast_horizon, freq="D")

        # Generate synthetic exogenous features (simulate with random noise from history)
        historical_exog = sarimax_model.model.exog
        future_exog = []
        for i in range(forecast_horizon):
            base_idx = np.random.randint(0, len(historical_exog))
            base_row = historical_exog[base_idx]
            noise = np.random.normal(0, 0.02, size=base_row.shape)
            if np.random.rand() < 0.2:  # occasional outlier
                noise += np.random.normal(0, 0.1, size=base_row.shape)
            future_exog.append(base_row + noise)

        future_exog_df = pd.DataFrame(future_exog, columns=exog_columns, index=future_dates)

        # Run SARIMAX forecast
        forecast_res = sarimax_model.get_forecast(steps=forecast_horizon, exog=future_exog_df)
        forecast_series = forecast_res.predicted_mean

        # Prepare output
        forecast_table = pd.DataFrame({
            "Date": future_dates.strftime("%d-%m-%Y"),
            "Forecasted_Yield": forecast_series.values
        })

        return {"status": "success", "forecast": forecast_table.to_dict(orient="records")}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
