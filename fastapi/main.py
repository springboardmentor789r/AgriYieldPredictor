from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import date, timedelta
from pathlib import Path
from typing import List
import pandas as pd
import joblib
import logging
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX

# ----------------------
# Logging
# ----------------------
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# ----------------------
# Prediction Model
# ----------------------
class YieldPrediction(BaseModel):
    temperature: float
    humidity: float
    soil_type: str = Field(..., alias="soilType")
    rainfall: float = 0.0
    weather_condition: str = Field("Unknown", alias="weather")
    crop_type: str = Field("Unknown", alias="cropType")

    class Config:
        allow_population_by_field_name = True

def load_pipeline():
    pipeline_path = Path(__file__).parent / "pipeline.pkl"
    if not pipeline_path.exists():
        raise FileNotFoundError(f"pipeline.pkl not found at {pipeline_path}")
    logger.info(f"Loading pipeline from: {pipeline_path}")
    return joblib.load(pipeline_path)

try:
    pipeline = load_pipeline()
except Exception as e:
    pipeline = None
    logger.exception("Failed to load pipeline: %s", e)

# ----------------------
# FastAPI App
# ----------------------
app = FastAPI(title="AgriYield Predictor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------
# Crop Recommendation Helper
# ----------------------
def recommend_crop(temperature, humidity, soil_type, rainfall, weather):
    """
    Simple crop recommendation based on environmental conditions.
    Can be replaced with more advanced ML logic.
    """
    if soil_type.lower() in ["loamy", "silty"] and 20 <= temperature <= 30 and humidity >= 50:
        return "Rice"
    elif soil_type.lower() == "sandy" and temperature > 25 and rainfall < 80:
        return "Corn"
    elif soil_type.lower() == "clay" and temperature < 25:
        return "Barley"
    elif humidity < 40 and rainfall < 50:
        return "Wheat"
    else:
        return "Soybeans"

# ----------------------
# Prediction Endpoint
# ----------------------
@app.post("/predict")
def predict(yieldPrediction: YieldPrediction):
    if pipeline is None:
        raise HTTPException(status_code=500, detail="Model pipeline not loaded on server")

    sample = pd.DataFrame([{
        "temperature": yieldPrediction.temperature,
        "humidity": yieldPrediction.humidity,
        "soil_type": yieldPrediction.soil_type,
        "rainfall": yieldPrediction.rainfall,
        "weather_condition": yieldPrediction.weather_condition,
        "crop_type": yieldPrediction.crop_type
    }])

    try:
        prediction = float(pipeline.predict(sample)[0])
        recommended_crop = recommend_crop(
            yieldPrediction.temperature,
            yieldPrediction.humidity,
            yieldPrediction.soil_type,
            yieldPrediction.rainfall,
            yieldPrediction.weather_condition
        )

        # Simple factor assessment
        factors = {
            "temperature": "Positive" if yieldPrediction.temperature > 25 else "Negative",
            "humidity": "Positive" if yieldPrediction.humidity > 60 else "Negative",
            "soil": "Excellent" if yieldPrediction.soil_type.lower() in ["loamy", "silty"] else "Good",
            "weather": "Optimal" if yieldPrediction.weather_condition.lower() == "sunny" else "Challenging",
        }

        return {
            "predicted_yield": round(prediction, 2),
            "confidence": "±0.3 tons/ha",
            "recommended_crop": recommended_crop,
            "factors": factors
        }

    except Exception as e:
        logger.exception("Prediction failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

# ----------------------
# Trend Forecast Endpoint
# ----------------------
class TrendRequest(BaseModel):
    from_date: date
    to_date: date

def _load_time_series_dataframe() -> pd.DataFrame:
    version_root = Path(__file__).parent.parent
    candidates = [
        version_root / "required" / "crop_date_yield.csv",
        version_root / "crop_date_yield.csv",
        Path(__file__).parent / "crop_date_yield.csv",
    ]
    csv_path = next((p for p in candidates if p.exists() and p.stat().st_size > 0), None)
    if csv_path is None:
        raise HTTPException(status_code=500, detail=f"Time series CSV not found in any candidate paths")

    df = pd.read_csv(csv_path, parse_dates=["Date"])
    df.set_index("Date", inplace=True)
    df = df.select_dtypes(include="number").groupby(df.index).mean()
    df = df.asfreq("D").interpolate(method="time")

    if "Crop_Yield" not in df.columns:
        raise HTTPException(status_code=500, detail="Column 'Crop_Yield' not found in dataset")
    return df

def _forecast_any_range(df: pd.DataFrame, start_date: pd.Timestamp, end_date: pd.Timestamp) -> pd.DataFrame:
    series = df["Crop_Yield"]
    exog = df.drop(columns=["Crop_Yield"]) if df.shape[1] > 1 else None

    arima_fit = ARIMA(series, order=(2, 1, 2)).fit()
    sarimax_fit = None
    if exog is not None and not exog.empty:
        try:
            sarimax_fit = SARIMAX(series, order=(1, 1, 1), exog=exog, seasonal_order=(0, 0, 0, 0)).fit(disp=False)
        except Exception as e:
            logger.warning("SARIMAX fit failed; using ARIMA only: %s", e)
            sarimax_fit = None

    desired_index = pd.date_range(start=start_date, end=end_date, freq="D")
    last_date = series.index.max()

    # ARIMA
    arima_series = pd.Series(index=desired_index, dtype=float)
    if desired_index[0] <= last_date:
        ins_end = min(last_date, desired_index[-1])
        arima_series.loc[desired_index[0]:ins_end] = arima_fit.predict(start=desired_index[0], end=ins_end)
    if desired_index[-1] > last_date:
        future_days = (desired_index[-1] - last_date).days
        if future_days > 0:
            arima_series.loc[last_date + pd.Timedelta(days=1):desired_index[-1]] = arima_fit.forecast(steps=future_days)

    # SARIMAX
    sarimax_series = pd.Series(index=desired_index, dtype=float)
    if sarimax_fit is not None:
        try:
            if desired_index[0] <= last_date:
                exog_slice = exog.loc[desired_index[0]:min(last_date, desired_index[-1])]
                sarimax_series.loc[exog_slice.index] = sarimax_fit.get_prediction(start=exog_slice.index[0], end=exog_slice.index[-1], exog=exog_slice).predicted_mean.values
            if desired_index[-1] > last_date:
                future_days = (desired_index[-1] - last_date).days
                future_exog = exog.tail(1).repeat(future_days)
                future_exog.index = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=future_days, freq="D")
                sarimax_series.loc[future_exog.index] = sarimax_fit.get_forecast(steps=future_days, exog=future_exog).predicted_mean.values
        except Exception as e:
            logger.warning("SARIMAX forecast failed; using ARIMA series instead: %s", e)
            sarimax_series = arima_series.copy()
    else:
        sarimax_series = arima_series.copy()

    result = pd.DataFrame({
        "ARIMA_Forecast": arima_series.values,
        "SARIMAX_Forecast": sarimax_series.values,
    }, index=desired_index)
    result["Average_Forecast"] = (result["ARIMA_Forecast"] + result["SARIMAX_Forecast"]) / 2.0
    return result

@app.post("/trend")
def trend_forecast(request: TrendRequest):
    if request.from_date > request.to_date:
        raise HTTPException(status_code=400, detail="from_date must be on or before to_date")
    try:
        df = _load_time_series_dataframe()
        start_ts = pd.Timestamp(request.from_date)
        end_ts = pd.Timestamp(request.to_date)

        max_days = 366
        if (end_ts - start_ts).days + 1 > max_days:
            raise HTTPException(status_code=400, detail=f"Date range too large. Max {max_days} days allowed.")

        forecast_df = _forecast_any_range(df, start_ts, end_ts)
        records = [{"date": idx.date().isoformat(), "yield_prediction": float(row["Average_Forecast"])} for idx, row in forecast_df.iterrows()]

        return {
            "from_date": request.from_date.isoformat(),
            "to_date": request.to_date.isoformat(),
            "rows": records,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Trend forecast failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
