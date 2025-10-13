from pydantic import BaseModel

class YieldPrediction(BaseModel):
    temperature: float
    soil_type: str
    humidity: float