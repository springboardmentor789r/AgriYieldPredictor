import React, { useState } from "react";
import "./FormPage.css";
import axios from "axios";

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(
      "http://localhost:8000/predict", 
      formData
    );
    alert("✅ Prediction Result:\n\n" + JSON.stringify(response.data, null, 2));
  } catch (error) {
    alert("❌ Error: " + error.message);
  }
};


const FormPage = () => {
  const [formData, setFormData] = useState({
    temperature: "",
    rainfall: "",
    humidity: "",
    soil_type: "",
    weather_condition: "",
    crop_type: "",
  });
  const [predictedYield, setPredictedYield] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // handle submit: send data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setPredictedYield(null);

    // Frontend validation
    const requiredFields = [
      "temperature",
      "rainfall",
      "humidity",
      "soil_type",
      "weather_condition",
      "crop_type"
    ];
    for (let field of requiredFields) {
      if (!formData[field] || String(formData[field]).trim() === "") {
        setErrorMsg("Please fill all fields correctly and try again.");
        return;
      }
    }
    // Additional validation for numbers
    if (
      isNaN(Number(formData.temperature)) ||
      isNaN(Number(formData.rainfall)) ||
      isNaN(Number(formData.humidity))
    ) {
      setErrorMsg("Temperature, Rainfall, and Humidity must be valid numbers.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/predict",
        formData
      );
      setPredictedYield(response.data.predicted_yield);
    } catch (error) {
      setErrorMsg(error.response?.data?.detail || error.message);
    }
  };

  return (
    <div className="form-bg">
      <div className="form-container">
        <h2 className="form-title">🌱 Crop Yield Prediction</h2>
        <p className="form-desc">Enter the details below to predict your crop yield.</p>

        <form onSubmit={handleSubmit}>
          {/* Temperature */}
          <div>
            <label className="form-label">🌡️ Temperature (°C) <span style={{color:'#718096',fontWeight:400}}>(10–45°C typical)</span></label>
            <input
              type="number"
              name="temperature"
              value={formData.temperature}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="e.g. 25"
              min={10}
              max={45}
            />
          </div>

          {/* Rainfall */}
          <div>
            <label className="form-label">🌧️ Rainfall (mm) <span style={{color:'#718096',fontWeight:400}}>(100–2000mm/year typical)</span></label>
            <input
              type="number"
              name="rainfall"
              value={formData.rainfall}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="e.g. 800"
              min={100}
              max={2000}
            />
          </div>

          {/* Humidity */}
          <div>
            <label className="form-label">💧 Humidity (%) <span style={{color:'#718096',fontWeight:400}}>(30–90% typical)</span></label>
            <input
              type="number"
              name="humidity"
              value={formData.humidity}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="e.g. 60"
              min={30}
              max={90}
            />
          </div>

          {/* Soil Type */}
          <div>
            <label className="form-label">🌍 Soil Type</label>
            <select
              name="soil_type"
              value={formData.soil_type}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select Soil Type</option>
              <option value="Clay">Clay</option>
              <option value="Sandy">Sandy</option>
              <option value="Loamy">Loamy</option>
              <option value="Peaty">Peaty</option>
              <option value="Silty">Silty</option>
            </select>
          </div>

          {/* Weather Condition */}
          <div>
            <label className="form-label">☀️ Weather Condition</label>
            <select
              name="weather_condition"
              value={formData.weather_condition}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select Weather</option>
              <option value="Sunny">Sunny</option>
              <option value="Rainy">Rainy</option>
              <option value="Stormy">Stormy</option>
              <option value="Cloudy">Cloudy</option>
            </select>
          </div>

          {/* Crop Type */}
          <div>
            <label className="form-label">🌾 Crop Type</label>
            <select
              name="crop_type"
              value={formData.crop_type}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select Crop</option>
              <option value="Wheat">Wheat</option>
              <option value="Barley">Barley</option>
              <option value="Corn">Corn</option>
              <option value="Soybeans">Soybeans</option>
              <option value="Rice">Rice</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="form-btn"
          >
            🚀 Predict Yield
          </button>
        </form>
        {/* Prediction Output UI */}
        {predictedYield !== null && (
          <div className="result-card">
            <h3 className="result-title">✅ Predicted Yield</h3>
            <p className="result-value">{predictedYield}</p>
          </div>
        )}
        {errorMsg && (
          <div className="error-card">
            <h3 className="error-title">❌ Error</h3>
            <p className="error-value">{errorMsg}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormPage;
