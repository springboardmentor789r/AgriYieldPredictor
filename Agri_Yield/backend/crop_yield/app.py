import os
import logging
from typing import Dict, Any, List
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel, Field
import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

MODEL_PATH = "model/crop_yield_pipeline.joblib"
CATEGORIES_PATH = "model/categories.joblib"
FEATURE_META_PATH = "model/feature_columns.joblib"
HOST = "0.0.0.0"
PORT = 8000

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("crop_predict_app")

app = FastAPI(title="Crop Yield Predictor API", description="API to predict crop yield (tons/ha) given environment and crop inputs.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if not os.path.exists(MODEL_PATH):
    raise RuntimeError(f"Model file '{MODEL_PATH}' not found. Run train_pipeline.py first to create it.")

model = joblib.load(MODEL_PATH)
logger.info(f"Loaded model from {MODEL_PATH}")

if os.path.exists(CATEGORIES_PATH):
    categories: Dict[str, List[Any]] = joblib.load(CATEGORIES_PATH)
    logger.info(f"Loaded categories from {CATEGORIES_PATH}")
else:
    categories = {}
    logger.warning("categories.joblib not found - using defaults in endpoints")

if os.path.exists(FEATURE_META_PATH):
    feature_meta = joblib.load(FEATURE_META_PATH)
    logger.info(f"Loaded feature metadata from {FEATURE_META_PATH}")
else:
    feature_meta = {"input_columns": [], "transformed_feature_names": []}
    logger.warning("feature_columns.joblib not found - metadata endpoints will be limited")

INPUT_FIELDS = [
    "Rainfall_mm",
    "Temperature_Celsius",
    "Days_to_Harvest",
    "Fertilizer_Used",
    "Irrigation_Used",
    "Region",
    "Soil_Type",
    "Crop",
    "Weather_Condition",
]

class PredictRequest(BaseModel):
    Rainfall_mm: float = Field(..., example=897.0772391101236)
    Temperature_Celsius: float = Field(..., example=27.676966373377603)
    Days_to_Harvest: float = Field(..., example=122)
    Fertilizer_Used: bool = Field(..., example=False)
    Irrigation_Used: bool = Field(..., example=True)
    Region: str = Field(..., example="West")
    Soil_Type: str = Field(..., example="Sandy")
    Crop: str = Field(..., example="Cotton")
    Weather_Condition: str = Field(..., example="Cloudy")

class PredictResponse(BaseModel):
    predicted_yield_tons_per_hectare: float

def _bool_to_numeric(v: bool) -> float:
    return 1.0 if v else 0.0

def _build_input_df(payload: Dict[str, Any]) -> pd.DataFrame:
    data = {}
    for k in INPUT_FIELDS:
        if k not in payload:
            raise ValueError(f"Missing required field: {k}")
        if k in ("Fertilizer_Used", "Irrigation_Used"):
            val = payload[k]
            if isinstance(val, str):
                val_lower = val.lower()
                if val_lower in ("true", "1", "yes"):
                    val = True
                else:
                    val = False
            data[k] = _bool_to_numeric(bool(val))
        else:
            data[k] = payload[k]
    return pd.DataFrame([data])

@app.get("/", response_class=HTMLResponse)
async def home():
    region_opts = categories.get("Region", ["West", "South", "North", "East"])
    soil_opts = categories.get("Soil_Type", ["Sandy", "Clay", "Loam", "Silt", "Chalky", "Peaty"])
    crop_opts = categories.get("Crop", ["Cotton", "Rice", "Barley", "Soybean", "Wheat", "Maize"])
    weather_opts = categories.get("Weather_Condition", ["Cloudy", "Rainy", "Sunny"])

    def opts_html(lst):
        return "".join(f'<option value="{v}">{v}</option>' for v in lst)

    html = f"""
    <html>
      <head><title>Crop yield predictor</title></head>
      <body>
        <h2>Crop yield predictor</h2>
        <form action="/predict_form" method="post">
          <label>Rainfall (mm): <input step="any" name="Rainfall_mm" required></label><br>
          <label>Temperature (°C): <input step="any" name="Temperature_Celsius" required></label><br>
          <label>Days to harvest: <input step="any" name="Days_to_Harvest" required></label><br>
          <label>Fertilizer used:
            <select name="Fertilizer_Used">
              <option value="True">True</option>
              <option value="False" selected>False</option>
            </select>
          </label><br>
          <label>Irrigation used:
            <select name="Irrigation_Used">
              <option value="True">True</option>
              <option value="False" selected>False</option>
            </select>
          </label><br>
          <label>Region:
            <select name="Region">{opts_html(region_opts)}</select>
          </label><br>
          <label>Soil Type:
            <select name="Soil_Type">{opts_html(soil_opts)}</select>
          </label><br>
          <label>Crop:
            <select name="Crop">{opts_html(crop_opts)}</select>
          </label><br>
          <label>Weather Condition:
            <select name="Weather_Condition">{opts_html(weather_opts)}</select>
          </label><br>
          <button type="submit">Predict</button>
        </form>
        <hr>
        <p>API documentation: <a href="/docs">/docs (Swagger UI)</a></p>
        <p>Use <code>POST /predict</code> with JSON to get predictions programmatically.</p>
      </body>
    </html>
    """
    return HTMLResponse(html)

@app.get("/categories", response_model=Dict[str, List[str]])
async def get_categories():
    defaults = {
        "Region": ["West", "South", "North", "East"],
        "Soil_Type": ["Sandy", "Clay", "Loam", "Silt", "Chalky", "Peaty"],
        "Crop": ["Cotton", "Rice", "Barley", "Soybean", "Wheat", "Maize"],
        "Weather_Condition": ["Cloudy", "Rainy", "Sunny"],
    }
    result = {k: categories.get(k, defaults[k]) for k in defaults}
    return result

@app.get("/metadata", response_model=Dict[str, List[str]])
async def get_metadata():
    return {
        "input_columns": feature_meta.get("input_columns", []),
        "transformed_feature_names": feature_meta.get("transformed_feature_names", []),
    }

@app.post("/predict", response_model=PredictResponse)
async def predict(payload: PredictRequest):
    try:
        df = _build_input_df(payload.dict())
        logger.debug(f"Input DataFrame:\n{df.head()}")
        pred = model.predict(df)[0]
    except Exception as e:
        logger.exception("Error during prediction")
        raise HTTPException(status_code=400, detail=str(e))
    return PredictResponse(predicted_yield_tons_per_hectare=float(pred))

@app.post("/predict_form", response_class=HTMLResponse)
async def predict_form(request: Request):
    form = await request.form()
    try:
        payload = {
            "Rainfall_mm": float(form["Rainfall_mm"]),
            "Temperature_Celsius": float(form["Temperature_Celsius"]),
            "Days_to_Harvest": float(form["Days_to_Harvest"]),
            "Fertilizer_Used": form.get("Fertilizer_Used", "False") in ("True", "true", "1", "yes"),
            "Irrigation_Used": form.get("Irrigation_Used", "False") in ("True", "true", "1", "yes"),
            "Region": form.get("Region", ""),
            "Soil_Type": form.get("Soil_Type", ""),
            "Crop": form.get("Crop", ""),
            "Weather_Condition": form.get("Weather_Condition", ""),
        }
        df = _build_input_df(payload)
        pred = model.predict(df)[0]
    except Exception as e:
        logger.exception("Form prediction error")
        return HTMLResponse(f"<h3>Invalid input or prediction error: {e}</h3>", status_code=400)
    return HTMLResponse(f"<h2>Predicted Yield (tons/ha): {pred:.4f}</h2><a href='/'>Back</a>")

@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": True}

logger.info("API ready. Visit /docs for interactive API documentation.")
