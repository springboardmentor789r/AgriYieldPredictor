# ts_utils.py (updated)
import os
import joblib
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")   # non-interactive backend
import matplotlib.pyplot as plt
from statsmodels.tsa.api import VAR
from statsmodels.tsa.stattools import adfuller, acf, pacf

TS_OUTPUT_DIR = os.path.join("static", "ts_outputs")
os.makedirs(TS_OUTPUT_DIR, exist_ok=True)


def read_crop_data(path: str, crop: str, freq: str = "W"):
    """
    Load dataset, filter by crop, resample to freq ('W' weekly or 'D' daily).
    If freq == 'D' and original data is sparse, we resample to 'D' and forward-fill / interpolate.
    """
    df = pd.read_csv(path)
    df["Date"] = pd.to_datetime(df["Date"], dayfirst=True, errors="coerce")
    df = df.dropna(subset=["Date"]).sort_values("Date")
    df_crop = df[df["Crop_Type"].str.lower() == crop.lower()]
    if df_crop.empty:
        raise ValueError(f"No records found for crop '{crop}'.")
    df_crop = df_crop.set_index("Date")
    features = ["Crop_Yield", "Temperature", "Humidity", "N", "P", "K"]
    df_crop = df_crop[features].apply(pd.to_numeric, errors="coerce")

    if freq.upper() == "W":
        # weekly aggregation (mean)
        df_out = df_crop.resample("W").mean().dropna()
    elif freq.upper() == "D":
        # resample to daily
        # strategy: resample to daily, then interpolate numeric columns (linear)
        df_daily = df_crop.resample("D").mean()
        # if entire column is NaN, it'll remain NaN; attempt forward/backward fill + linear interpolation
        df_daily = df_daily.interpolate(method="time", limit_direction="both")
        # if still NaNs (very sparse), try forward/backfill
        df_daily = df_daily.ffill().bfill()
        df_out = df_daily.dropna()
    else:
        raise ValueError("Unsupported freq. Use 'W' or 'D'.")

    if df_out.empty:
        raise ValueError(f"Resampled dataframe is empty after applying freq='{freq}'.")
    return df_out


def adf_test(series: pd.Series):
    """Run Augmented Dickey-Fuller Test."""
    result = adfuller(series)
    return {
        "adf_statistic": float(result[0]),
        "p_value": float(result[1]),
        "stationary": result[1] < 0.05
    }


def save_acf_pacf_linecharts(series: pd.Series, crop: str):
    """Generate separate line charts for ACF and PACF."""
    nlags = 20
    acf_vals = acf(series, nlags=nlags)
    pacf_vals = pacf(series, nlags=nlags)
    lags = np.arange(len(acf_vals))

    acf_path = os.path.join(TS_OUTPUT_DIR, f"{crop}_acf_linechart.png")
    plt.figure(figsize=(10, 5))
    plt.plot(lags, acf_vals, marker='o', linewidth=2)
    plt.axhline(0, color='black', linewidth=1)
    plt.title(f"{crop} Crop Yield - ACF")
    plt.xlabel("Lags")
    plt.ylabel("Correlation")
    plt.grid(True, linestyle="--", alpha=0.6)
    plt.tight_layout()
    plt.savefig(acf_path)
    plt.close()

    pacf_path = os.path.join(TS_OUTPUT_DIR, f"{crop}_pacf_linechart.png")
    plt.figure(figsize=(10, 5))
    plt.plot(lags, pacf_vals, marker='s', linewidth=2)
    plt.axhline(0, color='black', linewidth=1)
    plt.title(f"{crop} Crop Yield - PACF")
    plt.xlabel("Lags")
    plt.ylabel("Correlation")
    plt.grid(True, linestyle="--", alpha=0.6)
    plt.tight_layout()
    plt.savefig(pacf_path)
    plt.close()

    return acf_path, pacf_path


def train_var_model(df: pd.DataFrame, crop: str, lags: int = 2, save_path: str = None):
    """Train a VAR model for one crop and save as ts_model_<crop>[_D].pkl"""
    model = VAR(df)
    model_fitted = model.fit(lags)
    meta = {"crop": crop, "lags": lags, "features": list(df.columns)}
    if save_path is None:
        # default naming expects caller to set suffix when needed (e.g., _D)
        save_path = f"ts_model_{crop}.pkl"
    joblib.dump({"pipeline": model_fitted, "metadata": meta, "train_index": df.index}, save_path)
    return save_path, model_fitted


def load_var_model(crop: str, freq: str = "W"):
    """
    Load crop-specific VAR model.
    freq: 'W' -> ts_model_<crop>.pkl, 'D' -> ts_model_<crop>_D.pkl
    """
    suffix = "_D" if freq.upper() == "D" else ""
    path = f"ts_model_{crop}{suffix}.pkl"
    if not os.path.exists(path):
        raise FileNotFoundError(f"No trained model found for crop '{crop}' with freq '{freq}'. Expected file: {path}")
    return joblib.load(path)


def forecast_var(model_obj, df: pd.DataFrame, steps: int, crop: str = None):
    """
    Forecast `steps` ahead (steps = number of periods matching df frequency).
    Returns (forecast_df, csv_path, plot_path)
    """
    model_fitted = model_obj["pipeline"]
    if hasattr(model_fitted, "k_ar"):
        lag_order = model_fitted.k_ar
    else:
        lag_order = 1
    forecast_input = df.values[-lag_order:]
    forecast = model_fitted.forecast(y=forecast_input, steps=steps)

    # forecast index: same frequency as df
    freq = pd.infer_freq(df.index)
    # fallback: if freq is None, use daily
    if freq is None:
        freq = "D"
    forecast_index = pd.date_range(df.index[-1] + pd.tseries.frequencies.to_offset(freq),
                                   periods=steps, freq=freq)
    forecast_df = pd.DataFrame(forecast, index=forecast_index, columns=df.columns)

    crop_name = crop if crop is not None else model_obj["metadata"].get("crop", "crop")
    csv_name = f"{crop_name}_{steps}_step_forecast.csv"
    csv_path = os.path.join(TS_OUTPUT_DIR, csv_name)
    forecast_df.to_csv(csv_path)

    # Plot yield only
    plot_path = None
    if "Crop_Yield" in df.columns:
        plot_name = f"{crop_name}_{steps}_step_forecast_plot.png"
        plot_path = os.path.join(TS_OUTPUT_DIR, plot_name)
        plt.figure(figsize=(12, 5))
        plt.plot(df.index, df["Crop_Yield"], label="Actual", linewidth=2)
        plt.plot(forecast_df.index, forecast_df["Crop_Yield"], label="Forecast", linewidth=2, linestyle="--")
        plt.title(f"{crop_name} Forecast ({steps} steps ahead)")
        plt.xlabel("Date")
        plt.ylabel("Crop Yield")
        plt.legend()
        plt.grid(alpha=0.3)
        plt.tight_layout()
        plt.savefig(plot_path)
        plt.close()

    return forecast_df, csv_path, plot_path


def forecast_days_for_crop(csv_path: str, crop: str, days: int = 7):
    """
    High-level convenience function:
    - Try to load a daily model (ts_model_<crop>_D.pkl) and forecast `days`.
    - If daily model is missing but weekly model exists, fallback to weekly->daily interpolation:
       * load weekly model, forecast 1 week (or ceil(days/7) weeks),
       * linearly interpolate between last actual daily value and the weekly forecast value to produce daily series.
    Returns (forecast_df_daily, csv_path, plot_path)
    """
    # 1) try daily data + model
    try:
        df_daily = read_crop_data(csv_path, crop, freq="D")
    except Exception as e:
        raise RuntimeError(f"Could not load daily crop data for '{crop}': {e}")

    # Attempt to load daily model
    try:
        model_daily = load_var_model(crop, freq="D")
        forecast_df, csv_path_out, plot_path = forecast_var(model_daily, df_daily, steps=days, crop=crop)
        return forecast_df, csv_path_out, plot_path
    except FileNotFoundError:
        # fallback -> weekly model path
        try:
            # load weekly DF and weekly model
            df_weekly = read_crop_data(csv_path, crop, freq="W")
            model_weekly = load_var_model(crop, freq="W")
        except FileNotFoundError as e:
            raise FileNotFoundError(f"No suitable model found for crop '{crop}' (neither daily nor weekly). Train ts_model_{crop}[_D].pkl first. {e}")

        # forecast number of weeks needed to cover days
        weeks_needed = int(np.ceil(days / 7))
        weekly_forecast_df, weekly_csv, weekly_plot = forecast_var(model_weekly, df_weekly, steps=weeks_needed, crop=crop)

        # build daily forecast via interpolation:
        # last actual day's yield (use last available daily value from df_daily if exists, else interpolate from weekly)
        last_actual_date = df_daily.index[-1]
        last_actual_yield = df_daily["Crop_Yield"].iloc[-1]

        # create daily index for next `days`
        daily_index = pd.date_range(last_actual_date + pd.Timedelta(days=1), periods=days, freq="D")
        # map weekly forecast to days: take first weekly forecast value as end-point for day 7
        # We'll linearly interpolate from last_actual_yield to the first weekly forecast Crop_Yield over 7 days,
        # and if more weeks predicted, chain them
        weekly_vals = weekly_forecast_df["Crop_Yield"].values
        # expand weekly_vals to per-day target points at weeks 1,2,...
        # create an array of target values at day multiples of 7
        day_targets = []
        for w_val in weekly_vals:
            day_targets.append(float(w_val))

        # create a combined sequence of anchor days: start = last_actual_yield at day 0, anchors at day 7,14...
        anchors = [float(last_actual_yield)] + day_targets
        anchor_days = [0] + [7 * i for i in range(1, len(anchors))]

        # create interpolation over the required days (1..days)
        x_anchor = np.array(anchor_days)
        y_anchor = np.array(anchors)
        x_daily = np.arange(1, days + 1)
        y_daily = np.interp(x_daily, x_anchor, y_anchor)

        forecast_df_daily = pd.DataFrame({"Crop_Yield": y_daily}, index=daily_index)
        # For other variables (Temperature, Humidity, N,P,K) we can repeat or interpolate from weekly forecasts:
        # Simple approach: repeat interpolated values from weekly forecast columns via linear interpolation
        other_cols = [c for c in df_weekly.columns if c != "Crop_Yield"]
        for col in other_cols:
            # build anchors for this col
            anchors_col = [float(df_daily[col].iloc[-1]) if col in df_daily.columns else float(df_weekly[col].iloc[-1])]
            anchors_col += [float(v) for v in weekly_forecast_df[col].values]
            ycol = np.interp(x_daily, x_anchor, anchors_col)
            forecast_df_daily[col] = ycol

        # Save CSV and plot
        csv_out = os.path.join(TS_OUTPUT_DIR, f"{crop}_{days}_day_forecast_interpolated.csv")
        forecast_df_daily.to_csv(csv_out)

        # plot
        plot_out = os.path.join(TS_OUTPUT_DIR, f"{crop}_{days}_day_forecast_interpolated_plot.png")
        plt.figure(figsize=(12, 5))
        # plot recent actual daily (last 30 days) if available
        try:
            recent_actual = df_daily["Crop_Yield"].iloc[-30:]
            plt.plot(recent_actual.index, recent_actual.values, label="Actual (recent)", linewidth=2)
        except Exception:
            pass
        plt.plot(forecast_df_daily.index, forecast_df_daily["Crop_Yield"].values, label="Forecast (daily)", linestyle="--", linewidth=2)
        plt.title(f"{crop} - {days}-Day Forecast (interpolated)")
        plt.xlabel("Date")
        plt.ylabel("Crop Yield")
        plt.legend()
        plt.grid(alpha=0.3)
        plt.tight_layout()
        plt.savefig(plot_out)
        plt.close()

        return forecast_df_daily, csv_out, plot_out
