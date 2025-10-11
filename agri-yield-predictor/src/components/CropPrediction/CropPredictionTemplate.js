import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BiHome, BiLineChart } from 'react-icons/bi';
import Plot from 'react-plotly.js';
import './CropPredictionTemplate.css';

const CropPredictionTemplate = () => {
  const [formData, setFormData] = useState({
    temperature: '',
    rainfall: '',
    humidity: '',
    soilType: 'Sandy',
    weatherCondition: 'Sunny',
    cropType: 'Rice',
  });
  
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [forecastDate, setForecastDate] = useState('');
  const [forecastData, setForecastData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setPrediction({
        yield: (Math.random() * 10 + 5).toFixed(2),
        confidence: (Math.random() * 20 + 80).toFixed(2)
      });
      setLoading(false);
    }, 1000);
  };

  const generateForecast = () => {
    if (!forecastDate) return;
    
    // Generate sample forecast data
    const dates = [];
    const values = [];
    const currentDate = new Date(forecastDate);
    
    for (let i = 0; i < 10; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
      values.push(Math.random() * 10 + 5);
    }
    
    setForecastData({
      dates,
      values,
      layout: {
        title: '10-Day Yield Forecast',
        xaxis: { title: 'Date' },
        yaxis: { title: 'Yield (tons/hectare)' },
        margin: { t: 30, l: 50, r: 30, b: 40 },
        height: 300,
      }
    });
  };

  return (
    <div className="crop-prediction-page">
      <div className="nav-buttons">
        <Link to="/" className="nav-btn">
          <BiHome className="me-1" /> Home
        </Link>
        <Link to="/arima-forecast" className="nav-btn">
          <BiLineChart className="me-1" /> Go to Forecast
        </Link>
      </div>

      <div className="main-container">
        <h1 className="title">Crop Yield Prediction</h1>
        <p className="subtitle">Enter the details below to predict crop yield</p>
        
        <form onSubmit={handleSubmit} className="prediction-form">
          <div className="row">
            <div className="col-md-4 mb-3">
              <label htmlFor="temperature" className="form-label">Temperature (°C)</label>
              <input
                type="number"
                className="form-control"
                id="temperature"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="col-md-4 mb-3">
              <label htmlFor="rainfall" className="form-label">Rainfall (mm)</label>
              <input
                type="number"
                className="form-control"
                id="rainfall"
                name="rainfall"
                value={formData.rainfall}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="col-md-4 mb-3">
              <label htmlFor="humidity" className="form-label">Humidity (%)</label>
              <input
                type="number"
                className="form-control"
                id="humidity"
                name="humidity"
                value={formData.humidity}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-4 mb-3">
              <label htmlFor="soilType" className="form-label">Soil Type</label>
              <select
                className="form-select"
                id="soilType"
                name="soilType"
                value={formData.soilType}
                onChange={handleChange}
                required
              >
                <option value="Sandy">Sandy</option>
                <option value="Loamy">Loamy</option>
                <option value="Clay">Clay</option>
                <option value="Silt">Silt</option>
                <option
                value="Peaty">Peaty</option>
                <option
                value="Chalky">Chalky</option>
              </select>
            </div>
            
            <div className="col-md-4 mb-3">
              <label htmlFor="weatherCondition" className="form-label">Weather Condition</label>
              <select
                className="form-select"
                id="weatherCondition"
                name="weatherCondition"
                value={formData.weatherCondition}
                onChange={handleChange}
                required
              >
                <option value="Sunny">Sunny</option>
                <option value="Cloudy">Cloudy</option>
                <option value="Rainy">Rainy</option>
                <option value="Stormy">Stormy</option>
              </select>
            </div>
            
            <div className="col-md-4 mb-4">
              <label htmlFor="cropType" className="form-label">Crop Type</label>
              <select
                className="form-select"
                id="cropType"
                name="cropType"
                value={formData.cropType}
                onChange={handleChange}
                required
              >
                <option value="Rice">Rice</option>
                <option value="Wheat">Wheat</option>
                <option value="Maize">Maize</option>
                <option value="Soybean">Soybean</option>
                <option
                value="Cotton">Cotton</option>
                <option
                value="Barley">Barley</option>
              </select>
            </div>
          </div>
          
          <div className="text-center">
            <button type="submit" className="predict-btn" disabled={loading}>
              {loading ? 'Predicting...' : 'Predict Yield'}
            </button>
          </div>
        </form>
        
        {prediction && (
          <div className="result-card">
            <h2>Predicted Yield</h2>
            <div className="result-value">{prediction.yield} <small>tons/hectare</small></div>
            <div className="result-label">Confidence: {prediction.confidence}%</div>
          </div>
        )}
        
        <div className="forecast-section">
          <h3>Yield Forecast</h3>
          <div className="row align-items-center">
            <div className="col-md-8">
              <input
                type="date"
                className="form-control mb-3"
                value={forecastDate}
                onChange={(e) => setForecastDate(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <button 
                className="forecast-btn"
                onClick={generateForecast}
                disabled={!forecastDate}
              >
                Generate Forecast
              </button>
            </div>
          </div>
          
          {forecastData && (
            <div className="mt-4">
              <Plot
                data={[
                  {
                    x: forecastData.dates,
                    y: forecastData.values,
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: { color: '#28a745' },
                  },
                ]}
                layout={forecastData.layout}
                style={{ width: '100%' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropPredictionTemplate;
