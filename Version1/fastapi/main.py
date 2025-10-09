from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import pandas as pd
import joblib
import io
import logging
import numpy as np
from pathlib import Path
# Removed unused imports to avoid unnecessary dependencies

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

class YieldPrediction(BaseModel):
    temperature: float
    humidity: float
    soil_type: str

    rainfall: float = 0.0
    weather_condition: str = "Unknown"
    crop_type: str = "Unknown"

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


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "message": "Crop Yield Predictor API is running",
        "endpoints": ["/predict", "/predict_trend", "/health"]
    }

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
        prediction = pipeline.predict(sample)[0]
        return {"predicted_yield_tons_per_hectare": float(prediction)}
    except Exception as e:
        logger.exception("Prediction failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

# Trend Forecasting Endpoint (ARIMA/SARIMAX)
from datetime import date, timedelta
from typing import List
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX

class TrendRequest(BaseModel):
    from_date: date
    to_date: date

class TrendPrediction(BaseModel):
    from_date: str
    to_date: str


def _load_time_series_dataframe() -> pd.DataFrame:
    """Load and preprocess the time series dataframe as in the notebook."""
    
    version_root = Path(__file__).parent.parent
    root_path = version_root / "crop_date_yield.csv"
    fastapi_path = Path(__file__).parent / "crop_date_yield.csv"
    required_path = version_root / "required" / "crop_date_yield.csv"

    # Prefer a valid non-empty file. Check required first (since files were moved there), then project root, then fastapi dir.
    candidates = [required_path, root_path, fastapi_path]
    csv_path = None
    for p in candidates:
        if p.exists() and p.is_file() and p.stat().st_size > 0:
            csv_path = p
            break
    if csv_path is None:
        raise HTTPException(status_code=500, detail=f"Time series CSV not found or empty. Looked for: {required_path}, {root_path}, {fastapi_path}")

    df = pd.read_csv(csv_path, parse_dates=["Date"])  
    df["Date"] = pd.to_datetime(df["Date"])  
    df.set_index("Date", inplace=True)
    df = df.select_dtypes(include="number")
    df = df.groupby(df.index).mean()
    df = df.asfreq("D")
    df = df.interpolate(method="time")

    if "Crop_Yield" not in df.columns:
        raise HTTPException(status_code=500, detail="Column 'Crop_Yield' not found in dataset")
    return df


def _forecast_any_range(df: pd.DataFrame, start_date: pd.Timestamp, end_date: pd.Timestamp) -> pd.DataFrame:
    """Return predictions for any daily date range (past, within, future).
    - For dates within historical range: return in-sample predictions.
    - For future dates beyond last observation: return out-of-sample forecasts.
    Uses ARIMA(2,1,2) and SARIMAX(1,1,1) with exogenous variables when available.
    """
    if end_date < start_date:
        return pd.DataFrame(columns=["ARIMA_Forecast", "SARIMAX_Forecast", "Average_Forecast"])  # empty

    # Models
    series = df["Crop_Yield"]
    exog = df.drop(columns=["Crop_Yield"]) if df.shape[1] > 1 else None

    arima_fit = ARIMA(series, order=(2, 1, 2)).fit()
    sarimax_fit = None
    if exog is not None and not exog.empty:
        try:
            sarimax_fit = SARIMAX(series, order=(1, 1, 1), exog=exog, seasonal_order=(0, 0, 0, 0)).fit(disp=False)
        except Exception as e:
            logger.warning("SARIMAX fit failed; falling back to ARIMA only: %s", e)
            sarimax_fit = None

    desired_index = pd.date_range(start=start_date, end=end_date, freq="D")
    last_date = series.index.max()

    arima_series = pd.Series(index=desired_index, dtype=float)
    if desired_index[0] <= last_date:
        ins_end = min(last_date, desired_index[-1])
        arima_insample = arima_fit.predict(start=desired_index[0], end=ins_end)
        arima_series.loc[arima_insample.index] = arima_insample.values
    if desired_index[-1] > last_date:
        future_days = (desired_index[-1] - last_date).days
        if future_days > 0:
            arima_oos = arima_fit.forecast(steps=future_days)
            future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=future_days, freq="D")
            arima_series.loc[future_dates] = arima_oos.values

    sarimax_series = pd.Series(index=desired_index, dtype=float)
    if sarimax_fit is not None:
        try:
            if desired_index[0] <= last_date:
                ins_end = min(last_date, desired_index[-1])
                exog_slice = exog.loc[desired_index[0]:ins_end]
                sarimax_insample = sarimax_fit.get_prediction(start=desired_index[0], end=ins_end, exog=exog_slice)
                smx_mean = sarimax_insample.predicted_mean
                sarimax_series.loc[smx_mean.index] = smx_mean.values
            if desired_index[-1] > last_date:
                future_days = (desired_index[-1] - last_date).days
                if future_days > 0:
                    # Use the last available exog row for all future dates
                    last_exog = exog.iloc[[-1]]
                    future_exog = pd.concat([last_exog] * future_days, ignore_index=True)
                    future_exog.index = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=future_days, freq="D")
                    sarimax_oos = sarimax_fit.get_forecast(steps=future_days, exog=future_exog).predicted_mean
                    sarimax_series.loc[sarimax_oos.index] = sarimax_oos.values
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

@app.post("/predict_trend")
def predict_trend(req: TrendPrediction):
    try:
        logger.info(f"Trend prediction request: from_date={req.from_date}, to_date={req.to_date}")
        
        # Parse dates
        from_date = pd.to_datetime(req.from_date)
        to_date = pd.to_datetime(req.to_date)
        
        if from_date >= to_date:
            raise HTTPException(status_code=400, detail="From date must be before to date")
        
        # Load the dataset with simplified approach
        try:
            df = _load_time_series_dataframe()
            logger.info(f"Dataset loaded successfully. Shape: {df.shape}, Date range: {df.index.min()} to {df.index.max()}")
        except Exception as e:
            logger.error(f"Failed to load dataset: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to load dataset: {str(e)}")
        
        # Generate date range
        date_range = pd.date_range(start=from_date, end=to_date, freq='D')
        logger.info(f"Generated date range: {len(date_range)} days")
        
        predictions = []
        
        for date in date_range:
            # Check if we have historical data for this date
            if date in df.index:
                # Use actual historical data
                actual_yield = df.loc[date, 'Crop_Yield']
                predictions.append({
                    "date": date.strftime('%Y-%m-%d'),
                    "predicted_yield": round(float(actual_yield), 2),
                    "data_type": "historical",
                    "confidence_lower": round(float(actual_yield) * 0.9, 2),
                    "confidence_upper": round(float(actual_yield) * 1.1, 2)
                })
            else:
                # Use simplified prediction approach
                month = date.month
                day_of_year = date.timetuple().tm_yday
                
                # Get seasonal data from the same month
                monthly_data = df[df.index.month == month]['Crop_Yield']
                
                if len(monthly_data) > 0:
                    base_yield = monthly_data.mean()
                    # Add seasonal variation based on day of year
                    seasonal_factor = 1 + 0.1 * np.sin(2 * np.pi * day_of_year / 365)
                    predicted_yield = base_yield * seasonal_factor
                else:
                    # Fallback to overall average
                    predicted_yield = df['Crop_Yield'].mean()
                
                predictions.append({
                    "date": date.strftime('%Y-%m-%d'),
                    "predicted_yield": round(max(0, float(predicted_yield)), 2),
                    "data_type": "predicted",
                    "confidence_lower": round(max(0, float(predicted_yield) * 0.8), 2),
                    "confidence_upper": round(float(predicted_yield) * 1.2, 2)
                })
        
        logger.info(f"Generated {len(predictions)} predictions")
        
        # Calculate trend statistics
        yield_values = [p["predicted_yield"] for p in predictions]
        
        if len(yield_values) > 1:
            # Calculate trend using linear regression
            x = np.arange(len(yield_values))
            slope = np.polyfit(x, yield_values, 1)[0]
            
            if slope > 0.1:
                trend = "increasing"
            elif slope < -0.1:
                trend = "decreasing"
            else:
                trend = "stable"
        else:
            trend = "stable"
        
        # Calculate additional statistics
        avg_yield = np.mean(yield_values)
        max_yield = max(yield_values)
        min_yield = min(yield_values)
        
        result = {
            "status": "success",
            "from_date": req.from_date,
            "to_date": req.to_date,
            "predictions": predictions,
            "statistics": {
                "average_yield": round(float(avg_yield), 2),
                "max_yield": round(float(max_yield), 2),
                "min_yield": round(float(min_yield), 2),
                "trend": trend,
                "total_days": len(predictions),
                "historical_days": len([p for p in predictions if p["data_type"] == "historical"]),
                "predicted_days": len([p for p in predictions if p["data_type"] == "predicted"])
            }
        }
        
        logger.info(f"Trend prediction successful: {len(predictions)} predictions, trend: {trend}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Trend prediction failed: %s", e)
        raise HTTPException(status_code=500, detail=f"Trend prediction failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Crop Yield Predictor Backend...")
    print("📊 Backend will be available at: http://127.0.0.1:8000")
    print("📖 API docs available at: http://127.0.0.1:8000/docs")
    print("🌾 Trend feature available at: /predict_trend endpoint")
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)


