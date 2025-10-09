# 📦 Import Libraries
import pandas as pd
import matplotlib.pyplot as plt
import statsmodels.api as sm
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
from statsmodels.tsa.stattools import adfuller
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX

# -----------------------------
# 📁 Load and Preprocess Data
# -----------------------------
df_raw = pd.read_csv(r"E:\infosys\crop_yield_dataset.csv", parse_dates=True)
df_raw.set_index('Date', inplace=True)
df_raw.index = pd.to_datetime(df_raw.index)

# Separate target and exogenous
df = df_raw[['Crop_Yield']].copy()
exog = df_raw.drop(columns=['Crop_Yield']).copy()

# -----------------------------
# 🔹 Handle Duplicate Dates
# -----------------------------
df = df[~df.index.duplicated(keep='first')]
exog = exog[~exog.index.duplicated(keep='first')]

# -----------------------------
# 🔹 Encode Categorical Variables (if any)
# -----------------------------
exog_encoded = pd.get_dummies(exog, drop_first=True)

# -----------------------------
# 🔹 Resample and Interpolate
# -----------------------------
df = df.resample('D').mean()
df.interpolate(method='time', inplace=True)

exog_numeric = exog_encoded.resample('D').mean()
exog_numeric.interpolate(method='time', inplace=True)

# Align exogenous with target
exog_numeric = exog_numeric.reindex(df.index)
exog_numeric.fillna(method='ffill', inplace=True)

# -----------------------------
# 📊 ACF and PACF Plots
# -----------------------------
plt.figure(figsize=(15,5))
plt.subplot(121)
plot_acf(df['Crop_Yield'], lags=40, ax=plt.gca(), title='Autocorrelation Function')
plt.subplot(122)
plot_pacf(df['Crop_Yield'], lags=40, ax=plt.gca(), method='ywm', title='Partial Autocorrelation Function')
plt.suptitle('ACF and PACF Plots for Crop Yield')
plt.tight_layout()
plt.show()

# -----------------------------
# 🔍 Stationarity Check
# -----------------------------
result = adfuller(df['Crop_Yield'])
print(f"ADF Statistic: {result[0]}")
print(f"p-value: {result[1]}")
print("✅ Stationary" if result[1] < 0.05 else "⚠️ Non-stationary")

# -----------------------------
# 🔮 ARIMA Forecast
# -----------------------------
model_arima = ARIMA(df["Crop_Yield"], order=(2,1,2))
model_fit_arima = model_arima.fit()
forecast_steps_arima = 18
forecast_arima = model_fit_arima.forecast(steps=forecast_steps_arima)

plt.figure(figsize=(15,8))
plt.plot(df.index[-180:], df['Crop_Yield'][-180:], label="Actual", color="blue")
plt.plot(pd.date_range(df.index[-1] + pd.Timedelta(days=1), periods=forecast_steps_arima, freq='D'),
         forecast_arima, label="Forecast", color="red")
plt.title("ARIMA Forecast (Last 180 days + 18 days forecast)")
plt.legend()
plt.grid(True)
plt.show()

print("ARIMA Forecast (next 18 days):")
print(forecast_arima)

# -----------------------------
# 🧮 SARIMAX Forecast (Full Data) - Updated Exogenous
# -----------------------------
forecast_steps = 18
future_dates = pd.date_range(df.index[-1] + pd.Timedelta(days=1), periods=forecast_steps, freq='D')

# Extend numeric exogenous variables forward
forecast_exog = pd.DataFrame(
    {col: [exog_numeric[col].iloc[-1]]*forecast_steps for col in exog_numeric.columns},
    index=future_dates
)

# Fit SARIMAX model
model_sarimax = SARIMAX(
    df["Crop_Yield"],
    exog=exog_numeric,
    order=(2,1,2),
    seasonal_order=(0,0,0,0)
)
est = model_sarimax.fit(disp=False)

# Forecast
forecast_sarimax = est.get_forecast(steps=forecast_steps, exog=forecast_exog)
forecast_ci = forecast_sarimax.conf_int()

plt.figure(figsize=(15,8))
plt.plot(df.index[-180:], df["Crop_Yield"][-180:], label="Actual", color="blue")
plt.plot(future_dates, forecast_sarimax.predicted_mean, label="Forecast", color="red")
plt.fill_between(future_dates,
                 forecast_ci.iloc[:, 0],
                 forecast_ci.iloc[:, 1],
                 color='pink', alpha=0.3)
plt.legend(['Actual', 'Forecast', '95% Confidence Interval'])
plt.title('Crop Yield Forecast (SARIMAX with Exogenous Variables)')
plt.xlabel('Date')
plt.ylabel('Crop Yield')
plt.grid(True)
plt.tight_layout()
plt.show()

print(f"SARIMAX Forecast (next {forecast_steps} days):")
print(forecast_sarimax.predicted_mean)

# -----------------------------
# 📌 Feature Importance
# -----------------------------
plt.figure(figsize=(10,5))
feature_importance = abs(est.params[1:])  # Skip intercept
feature_importance.index = pd.Series(feature_importance.index).map(lambda x: x.replace('exog.', ''))
feature_importance.sort_values(ascending=True).plot(kind='barh')
plt.title('Feature Importance in SARIMAX Model')
plt.xlabel('Absolute Parameter Value')
plt.tight_layout()
plt.show()

# -----------------------------
# 🧪 SARIMAX with Train-Test Split and Seasonality
# -----------------------------
train = df.iloc[:-10]
test = df.iloc[-10:]
train_exog = exog_numeric.iloc[:-10]
test_exog = exog_numeric.iloc[-10:]

model_split = SARIMAX(
    train["Crop_Yield"],
    exog=train_exog,
    order=(1,1,1),
    seasonal_order=(0,1,1,12)
)
model_fit_split = model_split.fit(disp=False)

# Ensure test_exog has enough rows
if len(test_exog) < len(test):
    last_row = test_exog.iloc[[-1]].copy()
    repeat_rows = pd.concat([last_row]*(len(test)-len(test_exog)), ignore_index=True)
    test_exog = pd.concat([test_exog.reset_index(drop=True), repeat_rows], ignore_index=True)

forecast_split = model_fit_split.get_forecast(steps=len(test), exog=test_exog)
forecast_mean = forecast_split.predicted_mean
forecast_conf_int = forecast_split.conf_int()

plt.figure(figsize=(12,6))
plt.plot(test.index, test["Crop_Yield"], label="Actual Crop Yield", color="blue")
plt.plot(test.index, forecast_mean, linestyle="--", color="red", label="Forecast")
plt.fill_between(test.index, forecast_conf_int.iloc[:, 0], forecast_conf_int.iloc[:, 1], color="pink", alpha=0.3)
plt.title("SARIMAX Forecast with Train-Test Split")
plt.xlabel("Date")
plt.ylabel("Crop Yield")
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.show()

print("SARIMAX Forecast (next 10 days with train-test split):")
print(forecast_mean)
