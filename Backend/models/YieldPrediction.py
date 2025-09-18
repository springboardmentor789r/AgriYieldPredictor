from pydantic import BaseModel

class YieldPrediction(BaseModel):
    temperature: float
    humidity: float
    rainfall: float
    soil_type: str
    crop_type: str
    weather_condition: str