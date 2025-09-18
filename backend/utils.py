import pandas as pd
df = pd.read_csv("crop_yield_dataset.csv")

def get_soil_type():
    soil_type = df["soil_type"].unique().tolist()
    return soil_type



def get_crop_type():
    crop_type = df["crop_type"].unique().tolist()
    return crop_type




def get_weather_condition():
    weather_condition = df["weather_condition"].unique().tolist()
    return weather_condition




print(get_soil_type())
print()
print(get_crop_type())
print()
print(get_weather_condition())