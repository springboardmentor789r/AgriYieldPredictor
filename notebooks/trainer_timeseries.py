# trainer_compact_ts.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# CONFIG
DATA_PATH = "../data/Crop_Yield_and_Environmental_Factors.csv"  # or your actual dataset path
OUT_PATH = "../models/ts_autoreg_env_rf.joblib"
LAGS = 7
TARGET = "Crop_Yield"
DATE_COL = "Date"

def make_lags(df, lags=LAGS):
    df = df.sort_values(DATE_COL).reset_index(drop=True)
    for i in range(1, lags + 1):
        df[f"lag_{i}"] = df[TARGET].shift(i)
    return df.dropna().reset_index(drop=True)

def train():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"{DATA_PATH} not found.")
    df = pd.read_csv(DATA_PATH)
    df[DATE_COL] = pd.to_datetime(df[DATE_COL])

    # Keep only relevant columns
    required_cols = ["Crop_Type", "Soil_Type", TARGET, DATE_COL]
    for col in required_cols:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")

    df = df[required_cols]
    df_lag = make_lags(df, lags=LAGS)

    # Encode Crop_Type and Soil_Type
    encoders = {}
    for col in ["Crop_Type", "Soil_Type"]:
        le = LabelEncoder()
        df_lag[col] = le.fit_transform(df_lag[col])
        encoders[col] = le

    # Features: lag_1..lag_n + encoded categorical features
    feature_cols = [f"lag_{i}" for i in range(1, LAGS + 1)] + ["Crop_Type", "Soil_Type"]
    X = df_lag[feature_cols]
    y = df_lag[TARGET]

    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, shuffle=False, random_state=42)

    # Train model
    model = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    # Save metadata for inference
    train_feature_means = X_train.mean().to_dict()

    joblib.dump({
        "model": model,
        "lags": LAGS,
        "feature_order": feature_cols,
        "train_feature_means": train_feature_means,
        "encoders": encoders
    }, OUT_PATH)

    print("✅ Training complete")
    print("Train R²:", model.score(X_train, y_train))
    print("Val R²:", model.score(X_val, y_val))
    print(f"✅ Saved compact model to {OUT_PATH}")

if __name__ == "__main__":
    train()
