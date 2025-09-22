from pydantic import BaseModel

class YieldPrediction(BaseModel):
    Temperature: float
    Rainfall: float
    Humidity: float
    Soil_Type: str
    Weather_Condition: str
    Crop_Type: str
 