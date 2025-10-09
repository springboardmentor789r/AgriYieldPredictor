import pandas as pd
import numpy as np
from statsmodels.tsa.seasonal import STL
from statsmodels.tsa.arima.model import ARIMA

# --- Load dataset ---
df = pd.read_csv(r"E:\infosys\crop_yield_dataset_extended.csv", parse_dates=['Date'], dayfirst=True)
df.set_index('Date', inplace=True)
y = df['Crop_Yield'].asfreq('D')
y = y.fillna(method='ffill')  # forward-fill missing days

# --- STL decomposition to capture trend + seasonality ---
stl = STL(y, seasonal=7)  # weekly seasonality
result = stl.fit()
trend = result.trend
seasonal = result.seasonal
residual = result.resid

# --- ARIMA on residuals ---
arima_model = ARIMA(residual, order=(1,1,1))
arima_fit = arima_model.fit()

# --- Forecast next 60 days ---
forecast_days = 60
resid_forecast = arima_fit.get_forecast(steps=forecast_days).predicted_mean

# --- Extend trend and seasonality ---
last_trend = trend.iloc[-1]
trend_forecast = pd.Series([last_trend] * forecast_days, 
                           index=pd.date_range(start=y.index[-1]+pd.Timedelta(days=1), periods=forecast_days))
seasonal_forecast = seasonal[-7:].tolist() * (forecast_days // 7 + 1)
seasonal_forecast = pd.Series(seasonal_forecast[:forecast_days], index=trend_forecast.index)

# --- Combine components ---
forecast_values = trend_forecast + seasonal_forecast + resid_forecast
forecast_values = np.maximum(forecast_values, 0.1)  # avoid negatives

# --- Build forecast dataframe ---
forecast_df = pd.DataFrame({
    'Date': forecast_values.index,
    'Predicted_Crop_Yield': forecast_values.values
})

# --- Save CSV ---
forecast_df.to_csv("timeseries/forecast_next2months.csv", index=False)
print(f"✅ Forecast saved: timeseries/forecast_next2months.csv")
print(forecast_df.tail())
