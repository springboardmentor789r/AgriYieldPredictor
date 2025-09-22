from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np


with open("/Users/vibhutihardoneeya/Downloads/crop_yield_app/model/crop_yield_model.pkl", "rb") as f:
    model = pickle.load(f)

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

class CropData(BaseModel):
    cropType: str
    soilType: str
    soilQuality: str
    n: float
    p: float
    k: float
    temperature: float
    humidity: float
    ph: float
    windSpeed: float

@app.get("/", response_class=HTMLResponse)
async def serve_home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/predict")
async def predict(data: CropData):
    try:
        crop_map = {"Wheat": 0, "Rice": 1, "Maize": 2, "Sugarcane": 3}
        soil_map = {"Clay": 0, "Loamy": 1, "Sandy": 2}
        quality_map = {"Good": 2, "Medium": 1, "Poor": 0}

        crop_val = crop_map.get(data.cropType, -1)
        soil_val = soil_map.get(data.soilType, -1)
        quality_val = quality_map.get(data.soilQuality.capitalize(), -1)

        features = np.array([[
            crop_val, soil_val, quality_val,
            data.n, data.p, data.k,
            data.temperature, data.humidity, data.ph, data.windSpeed
        ]])

        prediction = model.predict(features)[0]

        return {"prediction": float(prediction)}
    except Exception as e:
        return {"error": str(e)}
