from pydantic import BaseModel

class YieldPrediction(BaseModel):
    temperature: float
    rainfall: float
    humidity: float
    soil_type: str
    weather_condition: str
    crop_type: str