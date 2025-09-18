from pydantic import BaseModel

class YieldPrediction(BaseModel):
    temperature: float       # in Celsius
    humidity: float          # percentage
    rainfall: float          # mm (millimeters)
    soil_type: str           # e.g., Sandy, Loamy, Clay
    crop_type: str           # e.g., Rice, Wheat, Corn
    weather_condition: str   # e.g., Sunny, Rainy, Cloudy
