from pydantic import BaseModel


class YieldPrediction(BaseModel):
    region: str
    soil_type: str
    crop_type: str
    rainfall_mm: float
    temperature: float
    weather_condition: str
    fertilizer_used: float
    irrigation_used: float
    days_to_harvest: int


class Item(BaseModel):
    id: int
    name: str
    price: float
    