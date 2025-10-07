from pydantic import BaseModel

class YieldRequest(BaseModel):
    Temperature: float 
    Rainfall: float     
    Humidity: float     
    Soil_Type: str
    Weather_Condition: str
    Crop_Type: str

class YieldResponse(BaseModel):
    predicted_yield: float
    units: str = "tons/hectare"
