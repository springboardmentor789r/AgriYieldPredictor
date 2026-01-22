# Agricultural Analytics Dashboard

## 🌾 Overview

This comprehensive agricultural analytics platform provides dual analysis capabilities:

1. **Crop Yield Prediction** - Real-time predictions based on environmental factors
2. **Time Series Forecasting** - Historical trend analysis and future forecasting

## 📁 Project Structure

```
FASTAPIDEMO/
├── frontend/                   # React frontend application
│   ├── src/                   # React source code
│   ├── public/                # Static assets
│   ├── package.json           # Frontend dependencies
│   └── node_modules/          # Installed packages
├── backend/                   # FastAPI backend server
│   ├── main.py               # Main FastAPI application
│   ├── app/                  # Application modules
│   │   ├── models/           # ML models integration
│   │   └── utils.py          # Utility functions
│   ├── data/                 # Dataset files
│   └── requirements.txt      # Python dependencies
├── time_series/              # Time series analysis & models
│   ├── Time_Series_Analysis.ipynb     # Jupyter analysis notebook
│   ├── recommended_time_series_dataset.csv  # Main dataset
│   ├── time_series_predictor.py       # Prediction models
│   ├── time_series_analyzer.py        # Analysis tools
│   └── TimeSeriesModels.py           # Model definitions
├── crop_yield/               # Crop yield prediction & models
│   ├── Crop_Yield_Analysis.ipynb     # Jupyter analysis notebook
│   ├── crop_yield_dataset.csv        # Main dataset
│   ├── crop_yield_predictor.py       # Prediction models
│   ├── YieldPrediction.py            # Model wrapper
│   └── final_yield_pipeline.pkl      # Trained model
├── myenv/                    # Python virtual environment
├── start_full_app.bat        # Launch script for both servers
└── README.md                 # This documentation
```

## 🚀 Quick Start

### Method 1: Use the Launch Script
```bash
# Double-click or run:
start_full_app.bat
```

### Method 2: Manual Start
```bash
# Activate virtual environment
myenv\Scripts\activate

# Start Backend (Terminal 1)
cd backend
python main.py

# Start Frontend (Terminal 2) 
cd frontend
npm start
```

## 🌐 Access Points

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📊 Features

### Crop Yield Prediction
- **Input Parameters**:
  - Temperature (°C)
  - Rainfall (mm)
  - Humidity (%)
  - Soil Type (Loamy, Sandy, Clay, Peaty, Silty)
  - Weather Condition (Sunny, Rainy, Cloudy, Stormy)
  - Crop Type (Rice, Wheat, Corn, Barley, Soybeans)

- **Output**: Predicted crop yield with confidence metrics

### Time Series Forecasting
- **Input Parameters**:
  - Data Source selection
  - Target Variable (Yield, Temperature, Humidity, Soil Quality)
  - Forecast Period (1-365 days)

- **Output**: Future predictions with trend analysis

## 📓 Jupyter Notebooks

### 1. crop_yield/Crop_Yield_Analysis.ipynb
- **Data Source**: `crop_yield_dataset.csv`
- **Features**:
  - Exploratory Data Analysis (EDA)
  - Statistical Analysis
  - Correlation Analysis
  - Interactive Visualizations
  - Model Performance Metrics

### 2. time_series/Time_Series_Analysis.ipynb  
- **Data Source**: `recommended_time_series_dataset.csv`
- **Features**:
  - Time Series Decomposition
  - Seasonality Analysis
  - Trend Forecasting
  - ARIMA Modeling
  - Interactive Time Series Plots

## 🎨 UI Features

### Side-by-Side Layout
- **Left Panel**: Crop Yield Prediction
- **Right Panel**: Time Series Forecasting
- **Bottom Section**: Quick access to Jupyter notebooks

### Interactive Forms
- Dynamic input forms with validation
- Real-time parameter adjustment
- Responsive design for all screen sizes

### Visual Feedback
- Loading indicators during processing
- Color-coded results display
- Error handling with user-friendly messages

## 📈 Data Sources

### Crop Yield Dataset
- **Location**: `backend/data/crop_yield_dataset.csv`
- **Size**: 1,002 records
- **Features**: Temperature, Rainfall, Humidity, Soil Type, Weather, Crop Type, Yield

### Time Series Dataset
- **Location**: `time_series/recommended_time_series_dataset.csv`
- **Size**: 36,522 records
- **Features**: Date, Crop Type, Soil Type, pH, Temperature, Humidity, Wind Speed, N, P, K, Yield, Soil Quality

## 🔧 Technical Stack

### Backend
- **Framework**: FastAPI
- **ML Libraries**: scikit-learn, pandas, numpy
- **Time Series**: statsmodels
- **Visualization**: matplotlib, seaborn

### Frontend
- **Framework**: React with TypeScript
- **Styling**: CSS Grid & Flexbox
- **API Communication**: Fetch API
- **UI Features**: Responsive design, form validation

### Analysis
- **Notebooks**: Jupyter Lab/Notebook
- **Visualization**: Plotly, matplotlib, seaborn
- **Data Processing**: pandas, numpy
- **ML Models**: Random Forest, Linear Regression, ARIMA

## 🛠️ Development

### Requirements
- Python 3.8+
- Node.js 14+
- Virtual environment activated

### API Endpoints
- `POST /api/predict` - Crop yield prediction
- `POST /api/time-series/predict` - Time series forecasting
- `GET /docs` - Interactive API documentation

### Environment Setup
```bash
# Python dependencies
pip install fastapi uvicorn pandas scikit-learn plotly statsmodels

# Node.js dependencies  
cd frontend
npm install
```

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Side-by-side dual panel layout
- **Tablet**: Stacked panels with optimized spacing  
- **Mobile**: Single column layout with touch-friendly controls

## 🎯 Use Cases

1. **Agricultural Planning**: Optimize crop selection based on environmental conditions
2. **Yield Forecasting**: Predict future crop yields for market planning
3. **Risk Assessment**: Analyze weather and soil impact on crop performance
4. **Data Analysis**: Interactive exploration of agricultural datasets
5. **Research**: Academic analysis of crop yield patterns and trends

## 🔄 Updates from Previous Version

### New Features
- **Dual Analysis Mode**: Both features accessible simultaneously
- **Enhanced UI**: Modern gradient design with better UX
- **Interactive Forms**: Real-time input validation and feedback
- **Jupyter Integration**: Direct access to analysis notebooks
- **Responsive Layout**: Optimized for all device types
- **Improved Data Visualization**: Better charts and statistical analysis

### Performance Improvements
- **Faster Loading**: Optimized component rendering
- **Better Error Handling**: User-friendly error messages
- **Enhanced Accessibility**: Better keyboard navigation and screen reader support

## 📞 Support

For technical support or feature requests, please refer to the project documentation or contact the development team.

---

**Last Updated**: October 2025  
**Version**: 2.0 - Side-by-Side Analytics Dashboard