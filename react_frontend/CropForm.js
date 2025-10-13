import React, { useState } from "react";
import "./CropForm.css";

function CropForm() {
  const [formData, setFormData] = useState({
    temperature: "",
    rainfall: "",
    humidity: "",
    soilType: "",
    weatherType: "",
    cropType: "",
  });

  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const soilOptions = ["Sandy", "Loamy", "Clayey", "Silty"];
  const weatherOptions = ["Sunny", "Rainy", "Cloudy", "Windy"];
  const cropOptions = ["Wheat", "Rice", "Corn", "Soybean"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setPrediction(null);

    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temperature: parseFloat(formData.temperature),
          rainfall: parseFloat(formData.rainfall),
          humidity: parseFloat(formData.humidity),
          soilType: formData.soilType,
          weatherType: formData.weatherType,
          cropType: formData.cropType,
        }),
      });

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();
      setPrediction(data.predictedYield);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="form-container">
      <h2>🌾 Crop Prediction Form</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Temperature (°C):</label>
          <input
            type="number"
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
            name="humidity"
            value={formData.humidity}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Soil Type:</label>
          <select name="soilType" value={formData.soilType} onChange={handleChange} required>
            <option value="">Select Soil</option>
            {soilOptions.map((soil) => (
              <option key={soil} value={soil}>{soil}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Weather Type:</label>
          <select name="weatherType" value={formData.weatherType} onChange={handleChange} required>
            <option value="">Select Weather</option>
            {weatherOptions.map((weather) => (
              <option key={weather} value={weather}>{weather}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Crop Type:</label>
          <select name="cropType" value={formData.cropType} onChange={handleChange} required>
            <option value="">Select Crop</option>
            {cropOptions.map((crop) => (
              <option key={crop} value={crop}>{crop}</option>
            ))}
          </select>
        </div>
        <button type="submit">Predict Yield</button>
      </form>

      {prediction && <div className="result"><h3>🌱 Predicted Yield: {prediction} tons/hectare</h3></div>}
      {error && <div className="result" style={{ background: "#ffdddd", color: "#a00000" }}><h3>{error}</h3></div>}
    </div>
  );
}

export default CropForm;
