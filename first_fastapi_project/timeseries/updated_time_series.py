import pandas as pd
import numpy as np

# 🧭 STEP 1: Load your dataset
data_path = r"E:\infosys\crop_yield_dataset.csv"
df = pd.read_csv(data_path, parse_dates=['Date'])
df.set_index('Date', inplace=True)
df.index = pd.to_datetime(df.index)

# 🧭 STEP 2: Find last date & create future date range
last_date = df.index.max()
end_date = pd.Timestamp("2025-09-30")

if last_date < end_date:
    future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), end=end_date, freq="D")

    # 🌦️ STEP 3: Pick baseline values from your last record
    base_temp = df['Temperature'].iloc[-1] if 'Temperature' in df.columns else 25
    base_rain = df['Rainfall'].iloc[-1] if 'Rainfall' in df.columns else 10
    base_humid = df['Humidity'].iloc[-1] if 'Humidity' in df.columns else 70

    # 🌱 Soil nutrients
    base_N = df['N'].iloc[-1] if 'N' in df.columns else 75
    base_P = df['P'].iloc[-1] if 'P' in df.columns else 35
    base_K = df['K'].iloc[-1] if 'K' in df.columns else 45

    # 📈 Crop yield trend (optional)
    base_yield = df['Crop_Yield'].iloc[-1] if 'Crop_Yield' in df.columns else 25

    # 🌾 STEP 4: Generate synthetic data with mild variation
    np.random.seed(42)
    synthetic_data = pd.DataFrame({
        "Temperature": base_temp + np.random.normal(0, 1.2, len(future_dates)),
        "Rainfall": base_rain + np.random.normal(0, 2.5, len(future_dates)),
        "Humidity": base_humid + np.random.normal(0, 2.0, len(future_dates)),
        "N": base_N + np.random.normal(0, 1.0, len(future_dates)),
        "P": base_P + np.random.normal(0, 0.5, len(future_dates)),
        "K": base_K + np.random.normal(0, 0.8, len(future_dates)),
        "Soil_pH": [6.5] * len(future_dates),
        "Soil_Quality": ["Medium"] * len(future_dates),
        "Soil_Type": ["Loamy"] * len(future_dates),
        "Crop_Type": ["Wheat"] * len(future_dates),
        "Year": [d.year for d in future_dates],
        # Optional: gently trending yield
        "Crop_Yield": base_yield + np.linspace(0, 1, len(future_dates)) + np.random.normal(0, 0.3, len(future_dates))
    }, index=future_dates)

    # 🧩 STEP 5: Combine old and new
    df_extended = pd.concat([df, synthetic_data])
    df_extended = df_extended[~df_extended.index.duplicated(keep='first')]

    # 💾 STEP 6: Save back to CSV
    df_extended.to_csv(r"E:\infosys\crop_yield_dataset_extended.csv")
    print(f"✅ Synthetic data added. New date range: {df_extended.index.min().date()} → {df_extended.index.max().date()}")
else:
    print("⚠️ Dataset already extends beyond 2025-09-30.")
