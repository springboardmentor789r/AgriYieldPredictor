from pydantic import BaseModel, validator
from typing import List, Optional, Dict, Any
from datetime import datetime

class FuturePredictionRequest(BaseModel):
    """Simple request model for predicting crop yield for future days"""
    data_source: str  # CSV file path (fixed to time_series_data.csv)
    target_variable: str = "Yield"  # Always predict crop yield
    days_to_predict: int  # Number of future days to predict
    
    @validator('data_source')
    def validate_data_source(cls, v):
        if not v or not v.strip():
            raise ValueError('Data source is required and cannot be empty')
        if not v.endswith('.csv'):
            raise ValueError('Only CSV files are supported')
        return v.strip()
    
    @validator('days_to_predict')
    def validate_days_to_predict(cls, v):
        if v < 1 or v > 365:
            raise ValueError('Days to predict must be between 1 and 365')
        return v

class TimeSeriesRequest(BaseModel):
    """Request model for time series analysis"""
    file_path: str  # Required, no default
    target_column: str  # Required, no default
    date_column: str  # Required, no default
    
    @validator('file_path')
    def validate_file_path(cls, v):
        if not v or not v.strip():
            raise ValueError('File path is required and cannot be empty')
        if not v.endswith('.csv'):
            raise ValueError('Only CSV files are supported')
        return v.strip()
    
    @validator('target_column', 'date_column')
    def validate_columns(cls, v):
        if not v or not v.strip():
            raise ValueError('Column name is required and cannot be empty')
        return v.strip()
    
class ARIMAParams(BaseModel):
    """ARIMA model parameters"""
    p: int
    d: int  
    q: int
    forecast_steps: int
    
    @validator('p', 'd', 'q')
    def validate_arima_params(cls, v):
        if v < 0 or v > 5:
            raise ValueError('ARIMA parameters must be between 0 and 5')
        return v
    
    @validator('forecast_steps')
    def validate_forecast_steps(cls, v):
        if v < 1 or v > 365:
            raise ValueError('Forecast steps must be between 1 and 365')
        return v

class TimeSeriesAnalysisRequest(BaseModel):
    """Complete time series analysis request"""
    data_source: str  # Required, no default
    target_variable: str  # Required, no default
    exogenous_variables: Optional[List[str]] = None
    forecast_horizon: int  # Required, no default
    model_type: str = "auto"  # "arima", "sarimax", "auto"
    
    @validator('data_source')
    def validate_data_source(cls, v):
        if not v or not v.strip():
            raise ValueError('Data source is required and cannot be empty')
        if not v.endswith('.csv'):
            raise ValueError('Only CSV files are supported')
        return v.strip()
    
    @validator('target_variable')
    def validate_target_variable(cls, v):
        if not v or not v.strip():
            raise ValueError('Target variable is required and cannot be empty')
        return v.strip()
    
    @validator('forecast_horizon')
    def validate_forecast_horizon(cls, v):
        if v < 1 or v > 365:
            raise ValueError('Forecast horizon must be between 1 and 365 days')
        return v
    
    @validator('model_type')
    def validate_model_type(cls, v):
        valid_types = ["arima", "sarimax", "auto"]
        if v not in valid_types:
            raise ValueError(f'Model type must be one of: {valid_types}')
        return v
    
class StationarityTestResult(BaseModel):
    """Stationarity test results"""
    test_name: str
    statistic: float
    p_value: float
    critical_values: Dict[str, float]
    is_stationary: bool
    interpretation: str

class ModelPerformance(BaseModel):
    """Model performance metrics"""
    model_name: str
    train_mae: float
    train_rmse: float
    test_mae: float
    test_rmse: float
    aic: Optional[float] = None
    bic: Optional[float] = None

class ForecastResult(BaseModel):
    """Forecast results"""
    dates: List[str]
    predictions: List[float]
    confidence_intervals: Optional[List[Dict[str, float]]] = None
    model_used: str
    performance_metrics: ModelPerformance

class SeasonalDecomposition(BaseModel):
    """Seasonal decomposition results"""
    trend_stats: Dict[str, float]
    seasonal_stats: Dict[str, float]
    residual_stats: Dict[str, float]
    seasonal_range: float

class TimeSeriesAnalysisResponse(BaseModel):
    """Complete time series analysis response"""
    data_summary: Dict[str, Any]
    stationarity_tests: List[StationarityTestResult]
    seasonal_decomposition: SeasonalDecomposition
    correlation_analysis: Dict[str, float]
    best_model: str
    model_comparison: List[ModelPerformance]
    forecast_results: ForecastResult
    business_insights: List[str]
    recommendations: List[str]

class PlotRequest(BaseModel):
    """Request for generating plots"""
    plot_type: str  # "overview", "decomposition", "acf_pacf", "forecast", "diagnostics"
    data_source: Optional[str] = "recommended_time_series_dataset.csv"
    target_variable: str = "Crop_Yield"
    
class DataUploadRequest(BaseModel):
    """Request for uploading time series data"""
    data: List[Dict[str, Any]]
    date_column: str = "Date"
    target_column: str = "Crop_Yield"