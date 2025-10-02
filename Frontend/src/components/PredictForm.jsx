import React, { useState } from "react";

export default function PredictForm() {
  const [formData, setFormData] = useState({
    temperature: "",
    humidity: "",
    rainfall: "",
    soil_type: "Sandy",          // match backend
    crop_type: "Rice",           // match backend
    weather_condition: "Sunny",  // match backend
  });

  const [prediction, setPrediction] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temperature: parseFloat(formData.temperature),
          humidity: parseFloat(formData.humidity),
          rainfall: parseFloat(formData.rainfall),
          soil_type: formData.soil_type,
          crop_type: formData.crop_type,
          weather_condition: formData.weather_condition,
        }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

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
      
      <form onSubmit={handleSubmit}>
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
          <select name="soil_type" value={formData.soil_type} onChange={handleChange}>
            <option>Sandy</option>
            <option>Loamy</option>
            <option>Peaty</option>
            <option>Clay</option>
            <option>Silty</option>
          </select>
        </label>

        <label>
          Crop Type:
          <select name="crop_type" value={formData.crop_type} onChange={handleChange}>
            <option>Rice</option>
            <option>Corn</option>
            <option>Barley</option>
            <option>Soybeans</option>
            <option>Wheat</option>
          </select>
        </label>

        <label>
          Weather Condition:
          <select
            name="weather_condition"
            value={formData.weather_condition}
            onChange={handleChange}
          >
            <option>Sunny</option>
            <option>Rainy</option>
            <option>Stormy</option>
            <option>Cloudy</option>
          </select>
        </label>

        <button type="submit">Predict</button>
      </form>

      {prediction !== null && (
        <div className="result">
          <h3>Predicted Yield: {prediction.toFixed(2)}</h3>
        </div>
      )}

      {errorMsg && <div className="error" style={{ color: "red" }}>{errorMsg}</div>}
    </div>
  );
}
