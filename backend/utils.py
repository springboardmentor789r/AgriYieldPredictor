import pandas as pd
df=pd.read_csv("crop_yield_dataset.csv")


def get_soil_types():
    soil_types=df['Soil Type'].unique().tolist()
    return soil_types


def get_crop_types():
    crop_types=df['Crop Type'].unique().tolist()
    return crop_types


def get_weather_conditions():
    weather_conditions=df['Weather Condition'].unique().tolist()
    return weather_conditions



    # Temperature: float
    # Raifall: float     
    # Humidity: float  