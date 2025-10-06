from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import pickle
from datetime import timedelta
from utils import get_soil_types, get_crop_types, get_weather_conditions

# ===============================
# Load trained models
# ===============================
with open("final_pipeline.pkl", "rb") as f:
    model = pickle.load(f)  # single prediction model

with open("timeseries_model.pkl", "rb") as f:
    model_multi = pickle.load(f)  # forecasting model

# ===============================
# Load dataset for forecast
# ===============================
df = pd.read_csv("synthesis_dataset_extended_with_trends.csv")
df["Date"] = pd.to_datetime(df["Date"])

numeric_cols = df.select_dtypes(include="number").columns.tolist()
non_numeric_cols = df.select_dtypes(exclude="number").columns.tolist()
if "Date" in non_numeric_cols:
    non_numeric_cols.remove("Date")

df_resampled = df.groupby("Date").agg(
    {**{col: "mean" for col in numeric_cols},
     **{col: "first" for col in non_numeric_cols}}
).reset_index()

# exogenous features (used for forecasting model)
exog_features = [
    "Soil_pH", "Temperature", "Humidity", "Wind_Speed",
    "N", "P", "K", "Soil_Quality"
]
exog = df_resampled[exog_features]
target_col = "Crop_Yield"

# ===============================
# Input Schemas
# ===============================
class YieldInput(BaseModel):
    Crop_Type: str
    Soil_Type: str
    Weather_Condition: str
    Temperature: float
    Raifall: float   # keeping typo as user requested
    Humidity: float

class ForecastRequest(BaseModel):
    date: str  # YYYY-MM-DD

# ===============================
# FastAPI Setup
# ===============================
app = FastAPI(title="Agri Yield Predictor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================
# Routes
# ===============================
@app.get("/")
def home():
    return {"message": "Welcome to Agri Yield Predictor API"}

@app.get("/crop_types")
def crop_types():
    return {"crop_types": get_crop_types()}

@app.get("/soil_types")
def soil_types():
    return {"soil_types": get_soil_types()}

@app.get("/weather_conditions")
def weather_conditions():
    return {"weather_conditions": get_weather_conditions()}

# Single Prediction
@app.post("/predict_yield")
def predict_yield(data: YieldInput):
    input_df = pd.DataFrame([data.dict()])
    prediction = model.predict(input_df)[0]
    return {"predicted_yield": round(float(prediction), 3)}

# 7-Day Forecast
@app.post("/forecast_yield")
def forecast_yield(request: ForecastRequest):
    try:
        user_date = pd.to_datetime(request.date)
        last_date = df_resampled["Date"].max()

        # Case A: User date inside dataset
        if user_date <= last_date:
            known_subset = df_resampled[df_resampled["Date"] >= user_date].head(7)

            if len(known_subset) == 7:
                known_subset["Date"] = known_subset["Date"].dt.strftime("%Y-%m-%d")
                return known_subset[["Date", target_col]].rename(
                    columns={target_col: "Yield"}
                ).to_dict(orient="records")

            days_missing = 7 - len(known_subset)

            exog_future = exog.tail(days_missing)
            if len(exog_future) < days_missing:
                exog_future = pd.DataFrame([exog.iloc[-1]] * days_missing)

            forecast_vals = model_multi.forecast(
                steps=days_missing, exog=exog_future[exog_features]
            )

            forecast_index = pd.date_range(
                start=last_date + timedelta(days=1),
                periods=days_missing,
                freq="D"
            )

            forecast_df = pd.DataFrame({"Date": forecast_index, "Yield": forecast_vals})

            combined = pd.concat([
                known_subset[["Date", target_col]].rename(columns={target_col: "Yield"}),
                forecast_df
            ])
            combined["Date"] = pd.to_datetime(combined["Date"]).dt.strftime("%Y-%m-%d")
            return combined.to_dict(orient="records")

        # Case B: User date beyond dataset
        else:
            steps_needed = (user_date - last_date).days + 7
            exog_future = exog.tail(steps_needed)
            if len(exog_future) < steps_needed:
                exog_future = pd.DataFrame([exog.iloc[-1]] * steps_needed)

            forecast_vals = model_multi.forecast(
                steps=steps_needed, exog=exog_future[exog_features]
            )

            forecast_index = pd.date_range(
                start=last_date + timedelta(days=1),
                periods=steps_needed,
                freq="D"
            )

            forecast_df = pd.DataFrame({"Date": forecast_index, "Yield": forecast_vals})

            subset = forecast_df[forecast_df["Date"] >= user_date].head(7)
            subset["Date"] = subset["Date"].dt.strftime("%Y-%m-%d")
            return subset.to_dict(orient="records")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast error: {str(e)}")
