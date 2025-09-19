import pandas as pd
df = pd.read_csv("crop_yield_dataset.csv")

# print(df.head())

def get_soil_type():
    soil_types = df["soil_type"].unique().tolist()
    return soil_types

def get_crop_type():
    crop_types = df["crop_type"].unique().tolist()
    return crop_types

def get_weather_condition():
    weather_conditions = df["weather_condition"].unique().tolist()
    return weather_conditions

print(get_soil_type())
print()