import pandas as pd
import numpy as np
df=pd.read_csv('crop_yield_dataset.csv')

def get_soil_type():
    return df['soil_type'].unique().tolist()
    return soil_types

def get_crop_type():
    return df['crop_type'].unique().tolist()
    return crop_types

def get_weather_condition():
    return df['weather_condition'].unique().tolist()
    return weather_conditions   

print(get_soil_type())
print()
print(get_crop_type())
print()
print(get_weather_condition())

