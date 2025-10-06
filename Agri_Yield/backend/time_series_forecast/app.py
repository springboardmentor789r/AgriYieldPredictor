from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import joblib
import numpy as np
import pandas as pd

app = FastAPI(title="Crop Yield Time Series Forecast API")

# ✅ Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load trained model
model_path = "model/hybrid_model.joblib"
try:
    model_data = joblib.load(model_path)
    print("✅ Model loaded successfully.")
except Exception as e:
    print(f"❌ Failed to load model: {e}")
    model_data = {}

# ✅ Define request schema
class ForecastRequest(BaseModel):
    horizon: int
    temperature: List[float]
    humidity: List[float]
    N: List[float]
    P: List[float]
    K: List[float]
    recent_yield: List[float]


@app.get("/")
def root():
    return {"message": "🌾 Crop Forecast API is running!"}


# ✅ Helper: create lag & rolling window features
def create_lag_features(y_series, lags=[1, 2, 3, 7, 14], roll_windows=[3, 7, 14]):
    feats = pd.DataFrame()
    for lag in lags:
        feats[f"Crop_Yield_lag{lag}"] = y_series.shift(lag)
    for w in roll_windows:
        feats[f"Crop_Yield_rollmean{w}"] = y_series.shift(1).rolling(window=w).mean()
        feats[f"Crop_Yield_rollstd{w}"] = y_series.shift(1).rolling(window=w).std()
    return feats


@app.post("/forecast")
def forecast(req: ForecastRequest):
    try:
        print("📦 Received Forecast Request")

        # Extract components
        lgb_model = model_data.get("lgb")
        sarimax_res = model_data.get("sarimax")
        scaler = model_data.get("scaler")

        if lgb_model is None or sarimax_res is None or scaler is None:
            return {"error": "Model data incomplete. Ensure hybrid_model.joblib includes lgb, sarimax, and scaler."}

        # Expand single values to match horizon
        def expand_feature(values):
            if len(values) == 1:
                return np.repeat(values[0], req.horizon)
            return np.array(values[:req.horizon])

        temp = expand_feature(req.temperature)
        hum = expand_feature(req.humidity)
        N = expand_feature(req.N)
        P = expand_feature(req.P)
        K = expand_feature(req.K)

        # ✅ Construct exogenous DataFrame
        exog = pd.DataFrame({
            "Temperature": temp,
            "Humidity": hum,
            "N": N,
            "P": P,
            "K": K
        })

        # ✅ Add lag & rolling features based on recent yield
        y_series = pd.Series(req.recent_yield)
        lag_feats = create_lag_features(y_series)

        # Use the last valid row of lag features as template for next predictions
        last_lag_feats = lag_feats.iloc[-1:].ffill().bfill().reset_index(drop=True)
        last_lag_feats = np.tile(last_lag_feats.values, (req.horizon, 1))
        lag_feat_names = lag_feats.columns

        lag_feats_df = pd.DataFrame(last_lag_feats, columns=lag_feat_names)

        # Combine exog + lag features (now 5 + 11 = 16)
        X_full = pd.concat([exog.reset_index(drop=True), lag_feats_df], axis=1)

        # ✅ Scale
        X_scaled = scaler.transform(X_full)

        # ✅ Predict
        pred_lgb = lgb_model.predict(X_scaled)
        pred_sarimax = sarimax_res.get_forecast(steps=req.horizon, exog=exog).predicted_mean

        # ✅ Combine forecasts
        hybrid_pred = 0.6 * pred_lgb + 0.4 * pred_sarimax

        # ✅ Clamp negative forecasts to zero
        hybrid_pred = np.maximum(hybrid_pred, 0)

        print("✅ Forecast successful.")
        return {"forecast_days": req.horizon, "forecast": hybrid_pred.tolist()}

    except Exception as e:
        print(f"❌ Forecast error: {e}")
        return {"error": str(e)}
