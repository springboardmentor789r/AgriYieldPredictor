from enum import Enum

class SoilType(str, Enum):
    Loamy = "Loamy"
    Sandy = "Sandy"
    Clay = "Clay"
    Silty = "Silty"

class WeatherCondition(str, Enum):
    Sunny = "Sunny"
    Rainy = "Rainy"
    Cloudy = "Cloudy"
    Windy = "Windy"

class CropType(str, Enum):
    Wheat = "Wheat"
    Rice = "Rice"
    Maize = "Maize"
    Barley = "Barley"

class Region(str, Enum):
    North = "North"
    South = "South"
    East = "East"
    West = "West"