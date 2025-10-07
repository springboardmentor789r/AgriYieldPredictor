import os
import logging
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# --- Imports from your project files ---
from ts_utils import read_crop_data, load_var_model, forecast_var, forecast_days_for_crop, TS_OUTPUT_DIR
from schemas import YieldRequest, YieldResponse
from utils import load_pipeline, prepare_input_dict_for_pipeline, MODEL_PATH
import joblib

# ------------------------------------------------------------
# ✅ Initialize app and CORS
# ------------------------------------------------------------
logger = logging.getLogger("uvicorn.error")

app = FastAPI(title="Agri Yield Predictor")
app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:3000",
        "http://127.0.0.1",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://[::1]:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------
# ✅ Load base model
# ------------------------------------------------------------
pipeline = None
metadata: Dict[str, Any] = {}

@app.on_event("startup")
def startup_event():
    global pipeline, metadata
    try:
        obj = load_pipeline(MODEL_PATH)
        if isinstance(obj, dict) and "pipeline" in obj:
            metadata = obj
            pipeline = obj["pipeline"]
        else:
            pipeline = obj
            metadata = {"pipeline": obj, "numeric_features": [], "categorical_features": [], "target_column": None}
        logger.info(f"Model pipeline loaded from {MODEL_PATH}")
    except Exception as e:
        pipeline = None
        metadata = {}
        logger.warning(f"Model pipeline not loaded at startup ({MODEL_PATH}): {e}")

# ------------------------------------------------------------
# ✅ Basic routes
# ------------------------------------------------------------
@app.get("/")
def root():
    return {"message": "🌾 Agri Yield Predictor API is running!"}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": pipeline is not None,
        "target_column": metadata.get("target_column"),
        "numeric_features": metadata.get("numeric_features"),
        "categorical_features": metadata.get("categorical_features"),
    }


@app.get("/metadata")
def get_metadata():
    if not metadata:
        raise HTTPException(status_code=404, detail="Model metadata not available. Train model first.")

    out = {
        "target_column": metadata.get("target_column"),
        "numeric_features": metadata.get("numeric_features", []),
        "categorical_features": metadata.get("categorical_features", []),
        "categories": {},
    }

    try:
        pl = metadata.get("pipeline")
        if pl is not None:
            if hasattr(pl, "named_steps") and "preprocessor" in pl.named_steps:
                pre = pl.named_steps["preprocessor"]
                if hasattr(pre, "transformers_"):
                    for name, trans, cols in pre.transformers_:
                        if hasattr(trans, "named_steps"):
                            for step_name, step in trans.named_steps.items():
                                if step_name.lower().startswith("onehot") and hasattr(step, "categories_"):
                                    if isinstance(cols, (list, tuple)):
                                        for i, c in enumerate(cols):
                                            try:
                                                out["categories"][c] = list(step.categories_[i])
                                            except Exception:
                                                out["categories"][c] = []
                        else:
                            if hasattr(trans, "categories_") and isinstance(cols, (list, tuple)):
                                for i, c in enumerate(cols):
                                    try:
                                        out["categories"][c] = list(trans.categories_[i])
                                    except Exception:
                                        out["categories"][c] = []
    except Exception as e:
        logger.debug("Could not extract categories: %s", e)

    return out

# ------------------------------------------------------------
# ✅ Yield prediction endpoint
# ------------------------------------------------------------
@app.post("/predict", response_model=YieldResponse)
def predict_yield(request: YieldRequest):
    global pipeline, metadata
    if pipeline is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Train model first (run trainer.py).")

    req_dict = request.dict()
    keys_variants = {k: v for k, v in req_dict.items()}
    for k, v in req_dict.items():
        keys_variants[k.replace("_", " ")] = v

    X_in = prepare_input_dict_for_pipeline(keys_variants, metadata)
    if X_in.isnull().all(axis=None):
        raise HTTPException(status_code=400, detail="Input could not be mapped to model features.")

    try:
        pred = pipeline.predict(X_in)[0]
    except Exception as e:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=400, detail=f"Prediction failed: {e}")

    return YieldResponse(predicted_yield=float(pred))

# ------------------------------------------------------------
# ✅ Retrain model endpoint
# ------------------------------------------------------------
@app.post("/retrain")
def retrain():
    trainer_path = "trainer.py"
    if not os.path.exists(trainer_path):
        raise HTTPException(status_code=404, detail="trainer.py not found in project folder.")
    import subprocess, sys

    try:
        proc = subprocess.run([sys.executable, trainer_path], capture_output=True, text=True, check=True)
    except subprocess.CalledProcessError as e:
        logger.error("Retrain failed: %s", e.stderr or e.stdout)
        raise HTTPException(status_code=500, detail=f"Retrain failed: {e.stderr or e.stdout}")

    try:
        new_meta = load_pipeline(MODEL_PATH)
        global pipeline, metadata
        if isinstance(new_meta, dict) and "pipeline" in new_meta:
            metadata = new_meta
            pipeline = new_meta["pipeline"]
        else:
            pipeline = new_meta
            metadata = {"pipeline": new_meta}
    except Exception as e:
        logger.exception("Retrain completed but failed to load new model")
        raise HTTPException(status_code=500, detail=f"Retrain completed but failed to load new model: {e}")

    return {"detail": "Retraining completed and model reloaded.", "trainer_output": proc.stdout}

# ------------------------------------------------------------
# ✅ Weekly and Daily VAR Forecasts
# ------------------------------------------------------------
class TimeSeriesRequest(BaseModel):
    crop: str
    weeks: int = 7

@app.post("/timeseries/forecast")
def forecast_timeseries(req: TimeSeriesRequest):
    try:
        df = read_crop_data("../data/Crop_Yield_and_Environmental_Factors.csv", req.crop)
        model_obj = load_var_model(req.crop)
        forecast_csv, forecast_df, plot_path = forecast_var(model_obj, df, req.weeks)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast failed: {e}")

    base = "/static/ts_outputs"
    return {
        "crop": req.crop,
        "weeks": req.weeks,
        "forecast_csv": f"{base}/{os.path.basename(forecast_csv)}",
        "forecast_plot": f"{base}/{os.path.basename(plot_path)}" if plot_path else None,
        "preview": forecast_df.head().to_dict(orient="records"),
    }


class TimeSeriesDaysRequest(BaseModel):
    crop: str
    days: int = 7

@app.post("/timeseries/forecast_days")
def forecast_days(req: TimeSeriesDaysRequest):
    try:
        forecast_df_daily, csv_path, plot_path = forecast_days_for_crop(
            "../data/Crop_Yield_and_Environmental_Factors.csv", req.crop, days=req.days
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to forecast days: {e}")

    base = "/static/ts_outputs"
    preview = []
    for idx, row in forecast_df_daily.iterrows():
        d = {"date": str(idx.date())}
        for col in forecast_df_daily.columns:
            d[col] = float(row[col])
        preview.append(d)

    return {
        "crop": req.crop,
        "days": req.days,
        "forecast_csv": f"{base}/{os.path.basename(csv_path)}",
        "forecast_plot": f"{base}/{os.path.basename(plot_path)}" if plot_path else None,
        "preview": preview,
    }

# ==========================================================
# ✅ Simplified Time-Series Forecast Endpoint (Final Stable)
# ==========================================================
import numpy as np
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta
from fastapi import HTTPException

# ---- Load model globally before defining the route ----
TS_ENV_MODEL_PATH = "../models/ts_autoreg_env_rf.joblib"
try:
    ts_env_meta = joblib.load(TS_ENV_MODEL_PATH)
    ts_env_model = ts_env_meta["model"]
    TS_ENV_LAGS = ts_env_meta["lags"]
    ENCODERS = ts_env_meta["encoders"]
    logger.info(f"✅ Loaded environmental time-series model from {TS_ENV_MODEL_PATH}")
except Exception as e:
    ts_env_model = None
    TS_ENV_LAGS = 7  # fallback
    ENCODERS = {}
    logger.warning(f"⚠️ Could not load time-series model: {e}")


# ---- Define request schema ----
class EnvForecastRequest(BaseModel):
    Crop_Type: str
    Soil_Type: str
    previous_yields: List[float]
    current_date: str


# ---- Define endpoint ----
@app.post("/timeseries/environment_forecast")
def forecast_environment_timeseries(req: EnvForecastRequest):
    """
    Forecast next 7 days yield using only crop, soil, and previous yields.
    """
    if ts_env_model is None:
        raise HTTPException(status_code=500, detail="Time-series model not loaded.")

    if len(req.previous_yields) < TS_ENV_LAGS:
        raise HTTPException(status_code=400, detail=f"Need at least {TS_ENV_LAGS} previous yields.")

    # Encode crop and soil type
    try:
        crop_enc = ENCODERS["Crop_Type"].transform([req.Crop_Type])[0]
        soil_enc = ENCODERS["Soil_Type"].transform([req.Soil_Type])[0]
    except Exception:
        raise HTTPException(status_code=400, detail="Crop or Soil type not recognized. Retrain model to include this crop/soil.")

    # Initialize lag window
    lags = list(req.previous_yields[-TS_ENV_LAGS:])
    preds, timeline = [], []

    try:
        start_date = datetime.fromisoformat(req.current_date)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    # Forecast next 7 days
    for i in range(7):
        feats = [lags[-lag] for lag in range(1, TS_ENV_LAGS + 1)]
        feats.extend([crop_enc, soil_enc])

        X = np.array(feats).reshape(1, -1)
        y_pred = ts_env_model.predict(X)[0]
        preds.append(float(y_pred))

        date = (start_date + timedelta(days=i + 1)).strftime("%Y-%m-%d")
        timeline.append({"date": date, "predicted_yield": float(y_pred)})

        # Slide window
        lags.append(float(y_pred))
        lags = lags[-TS_ENV_LAGS:]

    return {
        "crop": req.Crop_Type,
        "soil_type": req.Soil_Type,
        "forecast_7d": preds,
        "timeline": timeline,
        "note": "7-day forecast based on crop, soil, and previous yields only."
    }

