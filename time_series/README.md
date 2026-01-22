# Time Series Prediction Model

## Overview
This module handles time series analysis and forecasting for agricultural yield prediction using ARIMA models and advanced statistical techniques.

## Files
- `TimeSeriesModels.py` - Pydantic models for time series input/output
- `time_series_analyzer.py` - Comprehensive time series analysis
- `fast_time_series.py` - Optimized fast time series analysis
- `time_series_data.csv` - Historical time series dataset
- `time_series_predictor.py` - Main prediction logic

## Features
- ARIMA-based time series forecasting
- Fast prediction mode (< 3 seconds)
- Comprehensive analysis mode with detailed statistics
- Stationarity testing and data preprocessing
- Agricultural pattern recognition
- Confidence intervals for predictions

## Analysis Types
1. **Fast Analysis**: Quick forecasting optimized for speed
2. **Comprehensive Analysis**: Detailed statistical analysis with plots

## Usage
```python
from Time_Series_Model.time_series_predictor import TimeSeriesPredictor

predictor = TimeSeriesPredictor()

# Fast prediction
fast_result = predictor.predict_fast(data, forecast_days=7)

# Comprehensive analysis
detailed_result = predictor.analyze_comprehensive(data, forecast_days=30)
```

## Model Performance
- Processing Time: < 3 seconds (fast mode)
- Accuracy: MAE < 1.0 for most agricultural datasets
- Confidence Intervals: 95% prediction intervals provided