import pandas as pd
import joblib
import numpy as np

# Load model and preprocessor
model_fit = joblib.load("arima_model.pkl")
preprocessor = joblib.load("preprocessor.pkl")

# Suppose your training exog columns were:
exog_cols = ["Crop_Type", "Soil_Type", "Soil_pH", "Temperature",
             "Humidity", "Wind_Speed", "N", "P", "K", "Soil_Quality", "Year"]

# Create a DataFrame for next 7 days (example: repeat last known values)
# Replace this with actual forecasted exogenous values if available
last_exog_values = model_fit.model.exog[-1]  # last row of training exog
future_exog = np.tile(last_exog_values, (7, 1))  # repeat 7 times

# Forecast next 7 steps with exog
forecast = model_fit.forecast(steps=7, exog=future_exog)
print(forecast)
