import pandas as pd
df = pd.read_csv("models/crop_yield_1.csv")
print(df.head())

def fetch_soil_types():
    return df["soil_type"].unique().tolist()

def fetch_crop_types():
    return df["crop_type"].unique().tolist()

def fetch_weather_conditions():
    return df["weather_condition"].unique().tolist()