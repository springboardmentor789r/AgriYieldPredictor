import pandas as pd
df = pd.read_csv("models/crop_yield_dataset.csv")

def get_soil_type():
    soil_types = df["Soil_Type"].unique().tolist()
    return soil_types

def get_crop_type():
    crop_types = df["Crop_Type"].unique().tolist()
    return crop_types

def get_weather_condition():
    weather_conditions = df["Weather_Condition"].unique().tolist()
    return weather_conditions

print(get_soil_type())
print()
print(get_crop_type())
print()
print(get_weather_condition())
