# Crop Yield Prediction Model

## Overview
This module handles crop yield prediction using machine learning models based on environmental factors like temperature, rainfall, humidity, soil type, weather conditions, and crop type.

## Files
- `YieldPrediction.py` - Pydantic model for yield prediction input
- `crop_yield_dataset.csv` - Training dataset for crop yield prediction
- `final_yield_pipeline.pkl` - Trained ML pipeline for yield prediction
- `crop_yield_predictor.py` - Main prediction logic

## Features
- Multi-factor crop yield prediction
- Support for different crop types and soil conditions
- Weather-based yield forecasting
- Pre-trained ML pipeline with feature engineering

## Usage
```python
from Crop_Yield_Model.crop_yield_predictor import CropYieldPredictor

predictor = CropYieldPredictor()
prediction = predictor.predict(
    temperature=25.5,
    rainfall=120.0,
    humidity=65.0,
    soil_type="Loamy",
    weather_condition="Sunny",
    crop_type="Rice"
)
```