// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import "./App.css";

function FormPage() {
  const [formData, setFormData] = useState({
    rainfall: "",
    temperature: "",
    days_to_harvest: "",
    fertilizer_used: false,
    irrigation_used: false,
    region: "East",
    soil_type: "Sandy",
    crop_type: "Rice",
    weather: "Sunny",
    humidity: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        rainfall: parseFloat(formData.rainfall),
        temperature: parseFloat(formData.temperature),
        days_to_harvest: parseInt(formData.days_to_harvest || 0, 10),
        fertilizer_used: !!formData.fertilizer_used,
        irrigation_used: !!formData.irrigation_used,
        region: formData.region,
        soil_type: formData.soil_type,
        crop_type: formData.crop_type,
        weather: formData.weather,
        humidity: formData.humidity ? parseFloat(formData.humidity) : undefined
      };

      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const err = await res.text();
        alert("Prediction error: " + err);
        return;
      }

      const json = await res.json();
      // navigate to /predict and pass the predicted value in state
      navigate("/predict", { state: { predicted_yield: json.predicted_yield } });
    } catch (err) {
      console.error(err);
      alert("Network or server error: " + err.message);
    }
  };

  return (
    <div className="form-wrapper">
      <h2>Crop Yield Predictor</h2>
      <form onSubmit={handleSubmit}>
        <label>Rainfall (mm)</label>
        <input name="rainfall" value={formData.rainfall} onChange={handleChange} />

        <label>Temperature (°C)</label>
        <input name="temperature" value={formData.temperature} onChange={handleChange} />

        <label>Days to harvest</label>
        <input name="days_to_harvest" value={formData.days_to_harvest} onChange={handleChange} />

        <label>Humidity</label>
        <input name="humidity" value={formData.humidity} onChange={handleChange} />

        <label>
          <input type="checkbox" name="fertilizer_used" checked={formData.fertilizer_used} onChange={handleChange} />
          Fertilizer used
        </label>

        <label>
          <input type="checkbox" name="irrigation_used" checked={formData.irrigation_used} onChange={handleChange} />
          Irrigation used
        </label>

        <label>Region</label>
        <select name="region" value={formData.region} onChange={handleChange}>
          <option>East</option><option>West</option><option>North</option><option>South</option>
        </select>

        <label>Soil type</label>
        <select name="soil_type" value={formData.soil_type} onChange={handleChange}>
          <option>Sandy</option><option>Clay</option><option>Chalky</option><option>Loamy</option>
        </select>

        <label>Crop</label>
        <select name="crop_type" value={formData.crop_type} onChange={handleChange}>
          <option>Rice</option><option>Wheat</option><option>Barley</option>
        </select>

        <label>Weather</label>
        <select name="weather" value={formData.weather} onChange={handleChange}>
          <option>Sunny</option><option>Cloudy</option><option>Rainy</option>
        </select>

        <button type="submit">Predict</button>
      </form>
    </div>
  );
}

function ResultPage() {
  const location = useLocation();
  const predicted = location.state?.predicted_yield ?? "—";
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 80 }}>
      <div className="card">
        <h1>Predicted Yield</h1>
        <p>Your predicted yield is: <strong>{predicted}</strong></p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FormPage />} />
        <Route path="/predict" element={<ResultPage />} />
      </Routes>
    </Router>
  );
}
