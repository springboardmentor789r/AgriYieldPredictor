#!/usr/bin/env python3


from __future__ import annotations
import argparse
import json
import os
from typing import List, Optional, Tuple

import numpy as np
import pandas as pd
from statsmodels.tsa.stattools import adfuller, acf, pacf
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.api import VAR
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
import matplotlib.pyplot as plt
import joblib
import warnings

warnings.filterwarnings("ignore")


def ensure_outdir(out_dir: str):
    os.makedirs(out_dir, exist_ok=True)
    return out_dir


def read_and_filter(path: str, crop: Optional[str] = None) -> pd.DataFrame:
    """
    Reads CSV, parses Date, optionally filters by Crop_Type.
    Returns dataframe with Date parsed and sorted.
    """
    df = pd.read_csv(path)
    if "Date" not in df.columns:
        raise ValueError("Input CSV must have a 'Date' column")
    # try parsing with dayfirst True, fall back to pandas auto
    try:
        df["Date"] = pd.to_datetime(df["Date"], dayfirst=True, errors="coerce")
        if df["Date"].isna().all():
            df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    except Exception:
        df["Date"] = pd.to_datetime(df["Date"], errors="coerce")

    if df["Date"].isna().any():
        # warn and drop bad date rows
        df = df.dropna(subset=["Date"]).copy()

    df = df.sort_values("Date").reset_index(drop=True)
    if crop:
        if "Crop_Type" not in df.columns:
            raise ValueError("Input CSV must have a 'Crop_Type' column to filter by crop")
        df = df[df["Crop_Type"].astype(str).str.lower() == crop.lower()].copy()
        if df.empty:
            raise ValueError(f"No rows found for crop '{crop}'")
    df = df.set_index("Date")
    return df


def adf_test(series: pd.Series, signif: float = 0.05) -> dict:
    series = series.dropna()
    if len(series) < 3:
        raise ValueError("Series too short for ADF test (need at least 3 rows)")
    result = adfuller(series, autolag="AIC")
    output = {
        "ADF Statistic": float(result[0]),
        "p-value": float(result[1]),
        "Used Lag": int(result[2]),
        "Number of Observations": int(result[3]),
        "Critical Values": {k: float(v) for k, v in result[4].items()},
        "Stationary": bool(result[1] < signif)
    }
    return output


def auto_difference_until_stationary(series: pd.Series, max_d: int = 2, signif: float = 0.05):
    """
    Difference the series repeatedly until ADF indicates stationarity or until max_d reached.
    Returns (differenced_series, d) where d is number of differences applied.
    """
    s = series.dropna().copy()
    d = 0
    for i in range(max_d + 1):
        res = adf_test(s, signif=signif)
        if res["Stationary"]:
            return s, d, res
        # else difference and continue
        s = s.diff().dropna()
        d += 1
        if len(s) < 3:
            break
    # return last attempt and note non-stationary
    final_res = adf_test(s) if len(s) >= 3 else {"Stationary": False}
    return s, d, final_res


def compute_acf_pacf(series: pd.Series, nlags: int = 20) -> dict:
    series = series.dropna()
    acf_vals = acf(series, nlags=nlags, fft=False).tolist()
    pacf_vals = pacf(series, nlags=nlags, method="ld").tolist()
    return {"ACF": acf_vals, "PACF": pacf_vals}


def plot_and_save_acf_pacf(series: pd.Series, nlags: int, out_dir: str, prefix: str = "ac"):
    out_dir = ensure_outdir(out_dir)
    series = series.dropna()
    # ACF
    fig_acf = plt.figure(figsize=(8, 4))
    plot_acf(series, lags=nlags, ax=fig_acf.gca())
    acf_path = os.path.join(out_dir, f"{prefix}_acf.png")
    fig_acf.savefig(acf_path, bbox_inches="tight")
    plt.close(fig_acf)
    # PACF
    fig_pacf = plt.figure(figsize=(8, 4))
    plot_pacf(series, lags=nlags, ax=fig_pacf.gca(), method="ywm")
    pacf_path = os.path.join(out_dir, f"{prefix}_pacf.png")
    fig_pacf.savefig(pacf_path, bbox_inches="tight")
    plt.close(fig_pacf)
    return acf_path, pacf_path


def fit_arima(series: pd.Series, order: Tuple[int, int, int] = (1, 1, 1)):
    series = series.dropna()
    if len(series) < max(10, sum(order) + 3):
        # ARIMA needs some data; allow small datasets but warn
        pass
    model = ARIMA(series, order=order)
    model_fit = model.fit()
    return model_fit


def forecast_arima(model_fit, steps: int = 10) -> List[float]:
    f = model_fit.forecast(steps=steps)
    return [float(x) for x in f]


def save_model(obj, path: str):
    joblib.dump(obj, path)


def fit_var(df: pd.DataFrame, lags: int = 1):
    df = df.dropna()
    if df.shape[0] <= lags + 2:
        raise ValueError("Not enough rows for VAR with provided lag. Reduce lag or provide more data.")
    model = VAR(df)
    model_fit = model.fit(lags)
    return model_fit


def forecast_var(model_fit, df_history: pd.DataFrame, steps: int = 5):
    history_vals = df_history.values[-model_fit.k_ar:]  # k_ar = lag order used
    forecast = model_fit.forecast(history_vals, steps=steps)
    cols = df_history.columns.tolist()
    return pd.DataFrame(forecast, columns=cols)


def _write_json(obj, path: str):
    with open(path, "w") as f:
        json.dump(obj, f, indent=2, default=(lambda x: float(x) if isinstance(x, (np.floating, np.integer)) else str(x)))


def prepare_numeric_df_for_var(df: pd.DataFrame, cols: List[str]) -> pd.DataFrame:
    # Select requested columns and ensure numeric
    sub = df[cols].copy()
    for c in cols:
        if not pd.api.types.is_numeric_dtype(sub[c]):
            sub[c] = pd.to_numeric(sub[c], errors="coerce")
    sub = sub.dropna()
    return sub


def main():
    parser = argparse.ArgumentParser(description="Crop-time-series utilities (ADF / ACF / PACF / ARIMA / VAR) specialized for dataset")
    parser.add_argument("--mode", required=True, choices=["stationarity", "acf_pacf", "arima", "var"],
                        help="Operation to perform")
    parser.add_argument("--input", required=True, help="Path to input CSV file (crop dataset)")
    parser.add_argument("--crop", help="Crop name to filter by (e.g., Wheat)")
    parser.add_argument("--col", help="Column name for univariate ops (e.g., Crop_Yield)")
    parser.add_argument("--cols", help="Comma-separated columns for VAR (example: Crop_Yield,Temperature,Humidity,N,P,K)")
    parser.add_argument("--nlags", type=int, default=20, help="Number of lags for ACF/PACF")
    parser.add_argument("--order", nargs=3, type=int, default=[1, 1, 1], help="ARIMA order p d q (three ints)")
    parser.add_argument("--lags", type=int, default=1, help="Lag order for VAR")
    parser.add_argument("--steps", type=int, default=10, help="Forecast steps")
    parser.add_argument("--out_dir", default="ts_crop_outputs", help="Output directory for plots/models/results")
    parser.add_argument("--auto_diff", action="store_true", help="If set, automatically difference until series is stationary (max 2 diffs)")
    args = parser.parse_args()

    out_dir = ensure_outdir(args.out_dir)
    df = read_and_filter(args.input, crop=args.crop)

    crop_tag = args.crop if args.crop else "allcrops"

    if args.mode == "stationarity":
        if not args.col:
            raise SystemExit("stationarity mode requires --col (e.g., Crop_Yield)")
        if args.col not in df.columns:
            raise SystemExit(f"Column '{args.col}' not found in filtered data. Available: {df.columns.tolist()}")
        series = df[args.col]
        if args.auto_diff:
            series_to_use, d, adf_res = auto_difference_until_stationary(series, max_d=2)
            res = {"auto_diff_applied": d, "adf_result": adf_res}
        else:
            adf_res = adf_test(series)
            res = {"auto_diff_applied": 0, "adf_result": adf_res}
        _write_json(res, os.path.join(out_dir, f"{crop_tag}_{args.col}_adf.json"))
        print(json.dumps(res, indent=2))

    elif args.mode == "acf_pacf":
        if not args.col:
            raise SystemExit("acf_pacf mode requires --col")
        if args.col not in df.columns:
            raise SystemExit(f"Column '{args.col}' not found in filtered data. Available: {df.columns.tolist()}")
        series = df[args.col]
        res = compute_acf_pacf(series, nlags=args.nlags)
        acf_path, pacf_path = plot_and_save_acf_pacf(series, nlags=args.nlags, out_dir=out_dir, prefix=f"{crop_tag}_{args.col}")
        res_meta = {"acf_path": acf_path, "pacf_path": pacf_path, "nlags": args.nlags}
        res.update(res_meta)
        _write_json(res, os.path.join(out_dir, f"{crop_tag}_{args.col}_acf_pacf.json"))
        print(json.dumps(res_meta, indent=2))

    elif args.mode == "arima":
        if not args.col:
            raise SystemExit("arima mode requires --col")
        if args.col not in df.columns:
            raise SystemExit(f"Column '{args.col}' not found in filtered data. Available: {df.columns.tolist()}")
        series = df[args.col]
        # optional auto-difference
        d_applied = 0
        if args.auto_diff:
            series, d_applied, adf_res = auto_difference_until_stationary(series, max_d=2)
        order = tuple(args.order)
        # If d in ARIMA order not equal to d_applied, warn but proceed
        if order[1] != d_applied and args.auto_diff:
            print(f"Warning: auto_diff applied {d_applied} but requested ARIMA d={order[1]}. Consider aligning them.")
        model_fit = fit_arima(series, order=order)
        forecast = forecast_arima(model_fit, steps=args.steps)
        summary_text = str(model_fit.summary())
        model_path = os.path.join(out_dir, f"{crop_tag}_{args.col}_arima_order{order}.joblib".replace(" ", ""))
        save_model(model_fit, model_path)
        result = {
            "crop": args.crop,
            "column": args.col,
            "order": order,
            "auto_diff_applied": d_applied,
            "forecast_steps": args.steps,
            "forecast": forecast,
            "aic": float(model_fit.aic),
            "bic": float(model_fit.bic),
            "model_path": model_path
        }
        _write_json(result, os.path.join(out_dir, f"{crop_tag}_{args.col}_arima_result.json"))
        with open(os.path.join(out_dir, f"{crop_tag}_{args.col}_arima_summary.txt"), "w") as f:
            f.write(summary_text)
        print(json.dumps(result, indent=2))

    elif args.mode == "var":
        if not args.cols:
            raise SystemExit("var mode requires --cols (comma separated)")
        cols = [c.strip() for c in args.cols.split(",")]
        missing = [c for c in cols if c not in df.columns]
        if missing:
            raise SystemExit(f"Missing columns for VAR: {missing}. Available columns: {df.columns.tolist()}")
        df_var = prepare_numeric_df_for_var(df, cols)
        if df_var.empty:
            raise SystemExit("No numeric rows left after parsing/cleaning for VAR")
        # Stationarity note: VAR expects stationary series; user should difference if needed.
        try:
            model_fit = fit_var(df_var, lags=args.lags)
        except Exception as e:
            raise SystemExit(f"VAR fit error: {e}")
        forecast_df = forecast_var(model_fit, df_var, steps=args.steps)
        model_path = os.path.join(out_dir, f"{crop_tag}_var_model_lags{args.lags}.joblib")
        save_model(model_fit, model_path)
        forecast_path = os.path.join(out_dir, f"{crop_tag}_var_forecast_lags{args.lags}_steps{args.steps}.csv")
        forecast_df.to_csv(forecast_path, index=False)
        result = {
            "crop": args.crop,
            "cols": cols,
            "lags": args.lags,
            "forecast_steps": args.steps,
            "forecast_path": forecast_path,
            "model_path": model_path,
            "aic": float(model_fit.aic) if hasattr(model_fit, "aic") else None
        }
        _write_json(result, os.path.join(out_dir, f"{crop_tag}_var_result.json"))
        print(json.dumps(result, indent=2))

    else:
        raise SystemExit("Unknown mode")


if __name__ == "__main__":
    main()
