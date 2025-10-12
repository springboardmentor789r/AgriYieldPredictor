"""
FastAPI application for Crop Yield Prediction & Time Series Forecasting System
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
import uvicorn
import sys
import os

# Add parent directories to Python path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)
sys.path.append(os.path.join(parent_dir, "crop_yield"))
sys.path.append(os.path.join(parent_dir, "time_series"))

# Import models and utilities
from app.models.YieldPrediction import YieldPrediction
from app.models.TimeSeriesModels import FuturePredictionRequest, TimeSeriesRequest
from app.utils import get_soil_type, get_crop_type, get_weather_condition

# Initialize model classes as None first
CropYieldPredictor = None
FastTimeSeriesAnalyzer = None
TimeSeriesPredictor = None

# Try to import model classes
try:
    sys.path.append(os.path.join(parent_dir, "Crop_Yield_Model"))
    from crop_yield_predictor import CropYieldPredictor
    print("✓ CropYieldPredictor imported successfully")
except ImportError as e:
    print(f"Warning: Could not import CropYieldPredictor: {e}")

try:
    sys.path.append(os.path.join(parent_dir, "Time_Series_Model"))
    from fast_time_series import FastTimeSeriesAnalyzer
    from time_series_predictor import TimeSeriesPredictor
    print("✓ Time series modules imported successfully")
except ImportError as e:
    print(f"Warning: Could not import time series modules: {e}")

# Initialize FastAPI app
app = FastAPI(
    title="Crop Yield Prediction & Time Series Forecasting API",
    description="A comprehensive API for agricultural yield prediction and time series analysis",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize predictors
crop_predictor = CropYieldPredictor() if CropYieldPredictor else None
time_series_analyzer = FastTimeSeriesAnalyzer() if FastTimeSeriesAnalyzer else None
time_series_predictor = TimeSeriesPredictor() if TimeSeriesPredictor else None

# Serve static files (HTML frontend)
try:
    app.mount("/static", StaticFiles(directory="static"), name="static")
except:
    pass  # Directory might not exist

@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the main HTML page"""
    try:
        with open("index.html", "r") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        return HTMLResponse(content="""
        <html>
            <head><title>Crop Yield Prediction API</title></head>
            <body>
                <h1>🌾 Crop Yield Prediction & Time Series Forecasting API</h1>
                <p>API is running! Visit <a href="/docs">/docs</a> for interactive documentation.</p>
                <h2>Available Endpoints:</h2>
                <ul>
                    <li><a href="/docs">/docs</a> - Interactive API documentation</li>
                    <li><a href="/health">/health</a> - Health check</li>
                    <li><a href="/api/options">/api/options</a> - Get available options for form fields</li>
                    <li>POST /api/predict - Predict crop yield</li>
                    <li>POST /api/time-series/predict - Time series prediction</li>
                    <li>POST /api/time-series/analyze - Time series analysis</li>
                </ul>
            </body>
        </html>
        """)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Crop Yield Prediction API is running",
        "models_loaded": {
            "crop_predictor": crop_predictor is not None,
            "time_series_analyzer": time_series_analyzer is not None,
            "time_series_predictor": time_series_predictor is not None
        }
    }

@app.get("/api/options")
async def get_form_options():
    """Get available options for form fields"""
    return {
        "soil_types": get_soil_type(),
        "crop_types": get_crop_type(),
        "weather_conditions": get_weather_condition()
    }

@app.post("/api/predict")
async def predict_yield(prediction_input: YieldPrediction):
    """Predict crop yield based on environmental factors"""
    try:
        if crop_predictor is None:
            raise HTTPException(status_code=503, detail="Crop prediction model not available")
        
        result = crop_predictor.predict(prediction_input)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/api/time-series/predict")
async def predict_future_yield(request: FuturePredictionRequest):
    """Predict future crop yields using time series analysis"""
    try:
        if time_series_predictor is None:
            raise HTTPException(status_code=503, detail="Time series prediction model not available")
        
        # Call the predictor directly - it has fallback mechanisms built in
        result = time_series_predictor.predict_future_yield(forecast_days=request.days_to_predict)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Time series prediction failed: {str(e)}")

@app.post("/api/time-series/analyze")
async def analyze_time_series(request: TimeSeriesRequest):
    """Perform comprehensive time series analysis"""
    try:
        if time_series_analyzer is None:
            raise HTTPException(status_code=503, detail="Time series analyzer not available")
        
        # Check if file exists
        if not os.path.exists(request.file_path):
            # Try relative paths
            alternative_paths = [
                os.path.join("data", request.file_path),
                os.path.join("..", "Time_Series_Model", request.file_path),
                request.file_path
            ]
            file_found = False
            for path in alternative_paths:
                if os.path.exists(path):
                    request.file_path = path
                    file_found = True
                    break
            
            if not file_found:
                raise HTTPException(status_code=404, detail=f"File not found: {request.file_path}")
        
        # Perform analysis using the fast analyzer
        result = time_series_analyzer.analyze_time_series(
            request.file_path,
            request.target_column,
            request.date_column
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Time series analysis failed: {str(e)}")

@app.get("/api/time-series/sample-data")
async def get_sample_data():
    """Get sample time series data for testing"""
    try:
        data_file = os.path.join("data", "time_series_data.csv")
        if os.path.exists(data_file):
            import pandas as pd
            df = pd.read_csv(data_file)
            # Return first 10 rows as sample
            sample = df.head(10).to_dict('records')
            return {
                "sample_data": sample,
                "columns": list(df.columns),
                "total_rows": len(df)
            }
        else:
            return {
                "message": "Sample data file not found",
                "suggested_columns": ["Date", "Yield", "Temperature", "Rainfall"]
            }
    except Exception as e:
        return {"error": f"Could not load sample data: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )