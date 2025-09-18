import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    temperature: '',
    rainfall: '',
    humidity: '',
    soilType: '',
    weatherCondition: '',
    cropType: ''
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);
    
    try {
      const response = await axios.post('http://localhost:8000/predict', formData);
      setPrediction(response.data.prediction);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred while making the prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="form-container">
        <h1>Crop Yield Predictor</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Temperature (°C):</label>
            <input
              type="number"
              step="0.01"
              name="temperature"
              value={formData.temperature}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Rainfall (mm):</label>
            <input
              type="number"
              step="0.01"
              name="rainfall"
              value={formData.rainfall}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Humidity (%):</label>
            <input
              type="number"
              step="0.01"
              name="humidity"
              value={formData.humidity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Soil Type:</label>
            <select
              name="soilType"
              value={formData.soilType}
              onChange={handleChange}
              required
            >
              <option value="">Select Soil Type</option>
              <option value="Sandy">Sandy</option>
              <option value="Loamy">Loamy</option>
              <option value="Peaty">Peaty</option>
              <option value="Clay">Clay</option>
              <option value="Silty">Silty</option>
            </select>
          </div>

          <div className="form-group">
            <label>Weather Condition:</label>
            <select
              name="weatherCondition"
              value={formData.weatherCondition}
              onChange={handleChange}
              required
            >
              <option value="">Select Weather Condition</option>
              <option value="Rainy">Rainy</option>
              <option value="Stormy">Stormy</option>
              <option value="Cloudy">Cloudy</option>
              <option value="Sunny">Sunny</option>
            </select>
          </div>

          <div className="form-group">
            <label>Crop Type:</label>
            <select
              name="cropType"
              value={formData.cropType}
              onChange={handleChange}
              required
            >
              <option value="">Select Crop Type</option>
              <option value="Rice">Rice</option>
              <option value="Wheat">Wheat</option>
              <option value="Soybeans">Soybeans</option>
              <option value="Corn">Corn</option>
              <option value="Barley">Barley</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Predicting...' : 'Predict Yield'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}

        {prediction !== null && (
          <div className="prediction-result">
            <h2>Predicted Yield</h2>
            <p>{prediction.toFixed(2)} tons/hectare</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;