import React, { useState } from "react";
import "./App.css";


function App() {
  const [formData, setFormData] = useState({
    temperature: "",
    humidity: "",
    rainfall: "",
    soilType: "Sandy",
    cropType: "Rice",
    weather: "Sunny",
  });

  const [prediction, setPrediction] = useState(null);   // store predicted yield
  const [errorMsg, setErrorMsg] = useState(null);       // store any error

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPrediction(null);
    setErrorMsg(null);

    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          temperature: parseFloat(formData.temperature),
          humidity: parseFloat(formData.humidity),
          rainfall: parseFloat(formData.rainfall),
          soil_type: formData.soilType,
          crop_type: formData.cropType,
          weather_condition: formData.weather,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        setPrediction(data.predicted_yield);
      } else {
        setErrorMsg(data.message || "Prediction failed");
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    
      <div className="form-container">
        <h1>🌱 Crop Prediction</h1>

        <form className="crop-form" onSubmit={handleSubmit}>
          <label>
            Temperature (°C):
            <input
              type="number"
              step="0.1"
              name="temperature"
              value={formData.temperature}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Humidity (%):
            <input
              type="number"
              step="0.1"
              name="humidity"
              value={formData.humidity}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Rainfall (mm):
            <input
              type="number"
              step="0.1"
              name="rainfall"
              value={formData.rainfall}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Soil Type:
            <select name="soilType" value={formData.soilType} onChange={handleChange}>
              <option>Sandy</option>
              <option>Loamy</option>
              <option>Peaty</option>
              <option>Clay</option>
              <option>Silty</option>
            </select>
          </label>

          <label>
            Crop Type:
            <select name="cropType" value={formData.cropType} onChange={handleChange}>
              <option>Rice</option>
              <option>Corn</option>
              <option>Barley</option>
              <option>Soybeans</option>
              <option>Wheat</option>
            </select>
          </label>

          <label>
            Weather Condition:
            <select name="weather" value={formData.weather} onChange={handleChange}>
              <option>Sunny</option>
              <option>Rainy</option>
              <option>Stormy</option>
              <option>Cloudy</option>
            </select>
          </label>

          <button type="submit">Predict</button>
        </form>

        {/* Show prediction or error */}
        {prediction !== null && (
          <div className="result">
            <h2>Predicted Yield: {prediction.toFixed(2)}</h2>
          </div>
        )}
        {errorMsg && (
          <div className="error">
            <p style={{ color: "red" }}>{errorMsg}</p>
          </div>
        )}
      </div>
    
  );
}

export default App;
