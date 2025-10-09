import pandas as pd
from statsmodels.tsa.stattools import adfuller

# Exogenous columns
exog_cols = [
    "Crop_Type", "Soil_Type", "Soil_pH", "Temperature",
    "Humidity", "Wind_Speed", "N", "P", "K",
    "Soil_Quality", "Year"
]

def preprocess_data(df_raw):
    df_raw['Date'] = pd.to_datetime(df_raw['Date'])
    df_raw.set_index('Date', inplace=True)

    # ✅ create Year column if not exists
    if 'Year' not in df_raw.columns:
        df_raw['Year'] = df_raw.index.year

    df = df_raw[['Crop_Yield']].copy()
    existing_exog = [c for c in exog_cols if c in df_raw.columns]
    exog = df_raw[existing_exog]

    # Resample & fill missing values
    df = df.resample('D').mean()
    df.interpolate(method='time', inplace=True)
    exog = exog.reindex(df.index).ffill()

    return df, exog

def run_adf_test(series):
    result = adfuller(series.dropna())
    print(f"ADF Statistic: {result[0]}")
    print(f"p-value: {result[1]}")
    if result[1] < 0.05:
        print("✅ Stationary")
    else:
        print("⚠️ Non-stationary")
