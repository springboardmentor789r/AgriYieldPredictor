import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from statsmodels.tsa.stattools import adfuller
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX

df = pd.read_csv(r"c:\Users\dasam\OneDrive\Documents\Desktop\Infosys\AgriYield_Project\crop_date_yield.csv", parse_dates=["Date"])
df['Date'] = pd.to_datetime(df['Date'])
df.set_index("Date", inplace=True)
df = df.select_dtypes(include="number")
df = df.groupby(df.index).mean()
df = df.asfreq("D")
df = df.interpolate(method="time")

print("\n=== Univariate Analysis (ARIMA) ===")
series = df["Crop_Yield"]

plt.figure(figsize=(15,6))
plt.subplot(121)
plot_acf(series.dropna(), lags=40, ax=plt.gca(), title='Autocorrelation Function')
plt.grid(True)
plt.subplot(122)
plot_pacf(series.dropna(), lags=40, ax=plt.gca(), method="ywm", title='Partial Autocorrelation Function')
plt.grid(True)
plt.suptitle("ACF and PACF Plots for Crop Yield")
plt.tight_layout()
plt.show()

plt.figure(figsize=(15,6))
plt.plot(series.index, series.values, label='Original Series')
plt.title('Original Crop Yield Time Series')
plt.grid(True)
plt.legend()
plt.show()

print("\n=== ARIMA Model ===")
model = ARIMA(df["Crop_Yield"], order=(2,1,2))
model_fit = model.fit()
forecast = model_fit.forecast(10)

plt.figure(figsize=(15,6))
plt.plot(series.index[-100:], series.values[-100:], label='Actual', color='blue')
plt.plot(pd.date_range(start=series.index[-1], periods=11, freq='D')[1:], 
         forecast, '--', label='Forecast', color='red')
plt.title('ARIMA Forecast (Last 100 days + 10 days forecast)')
plt.grid(True)
plt.legend()
plt.show()

print("\nARIMA Forecast (next 10 days):")
print(forecast)

print("\n=== Multivariate Analysis (SARIMAX) ===")

target = df["Crop_Yield"]

target = df["Crop_Yield"]
exog = df.drop(columns=["Crop_Yield"])

model = SARIMAX(target, order=(1,1,1), exog=exog, seasonal_order=(0,0,0,0))
fit = model.fit(disp=False)

forecast_steps = 10
future_exog = exog.iloc[-forecast_steps:]

forecast = fit.get_forecast(steps=forecast_steps, exog=future_exog)
forecast_mean = forecast.predicted_mean
forecast_ci = forecast.conf_int()

print("\nSARIMAX Forecast (next 10 days):")
print(forecast_mean)

plt.figure(figsize=(15,6))
plt.plot(target.index[-100:], target[-100:], label="Actual Crop Yield", color='blue')
plt.plot(forecast_mean.index, forecast_mean, linestyle="--", color="red", label="Forecast")

plt.fill_between(forecast_ci.index,
                 forecast_ci.iloc[:,0],
                 forecast_ci.iloc[:,1],
                 color="pink", alpha=0.3,
                 label="95% Confidence Interval")

plt.grid(True)
plt.legend(loc='best')
plt.title("Crop Yield Forecast (SARIMAX with Exogenous Variables)")
plt.xlabel("Date")
plt.ylabel("Crop Yield")
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()

plt.figure(figsize=(10,5))
feature_importance = np.abs(fit.params[1:])
feature_importance = pd.Series(feature_importance, index=exog.columns)
feature_importance.sort_values(ascending=True).plot(kind='barh')
plt.title('Feature Importance in SARIMAX Model')
plt.xlabel('Absolute Parameter Value')
plt.tight_layout()
plt.show()
