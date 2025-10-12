import React, { useState } from "react";
import "./index.css";

export default function CropForm() {
  const [temperature, setTemperature] = useState("");
  const [rainfall, setRainfall] = useState("");
  const [humidity, setHumidity] = useState("");
  const [soilType, setSoilType] = useState("Loamy");
  const [weatherCondition, setWeatherCondition] = useState("Sunny");
  const [cropType, setCropType] = useState("Wheat");
  const [n, setN] = useState("");
  const [p, setP] = useState("");
  const [k, setK] = useState("");
  const [soilph, setSoilph] = useState("");
  const [region, setRegion] = useState("North");
  const [prediction, setPrediction] = useState("");

  const handlePredict = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8080/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Temperature_C: Number(temperature),
          Rainfall_mm: Number(rainfall),
          Humidity_pct: Number(humidity),
          Soil_Type: soilType,
          Weather_Condition: weatherCondition,
          Crop_Type: cropType,
          N_kg_per_ha: Number(n),
          P_kg_per_ha: Number(p),
          K_kg_per_ha: Number(k),
          Soil_pH: Number(soilph),
          Region: region,
        }),
      });

      if (!response.ok) throw new Error("API Error");

      const data = await response.json();
      console.log("API Response:", data);

      // ✅ Use backticks for template literal
      setPrediction(
        `Crop: ${data.crop}, Region: ${data.region}, Predicted Yield: ${data.predicted_yield_tons_per_hectare.toFixed(2)} tons/ha`
      );
    } catch (err) {
      console.error(err);
      setPrediction("Failed to get prediction. Check API or values.");
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Crop Yield Prediction</h1>
      <div className="form-card">
        <div className="form-grid">
          <div>
            <label>Temperature (°C)</label>
            <input
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
            />
          </div>

          <div>
            <label>Rainfall (mm)</label>
            <input
              type="number"
              value={rainfall}
              onChange={(e) => setRainfall(e.target.value)}
            />
          </div>

          <div>
            <label>Humidity (%)</label>
            <input
              type="number"
              value={humidity}
              onChange={(e) => setHumidity(e.target.value)}
            />
          </div>

          <div>
            <label>Soil pH</label>
            <input
              type="number"
              step="0.1"
              value={soilph}
              onChange={(e) => setSoilph(e.target.value)}
            />
          </div>

          <div>
            <label>N (kg/ha)</label>
            <input
              type="number"
              value={n}
              onChange={(e) => setN(e.target.value)}
            />
          </div>

          <div>
            <label>P (kg/ha)</label>
            <input
              type="number"
              value={p}
              onChange={(e) => setP(e.target.value)}
            />
          </div>

          <div>
            <label>K (kg/ha)</label>
            <input
              type="number"
              value={k}
              onChange={(e) => setK(e.target.value)}
            />
          </div>

          <div>
            <label>Soil Type</label>
            <select value={soilType} onChange={(e) => setSoilType(e.target.value)}>
              <option>Loamy</option>
              <option>Sandy</option>
              <option>Clay</option>
            </select>
          </div>

          <div>
            <label>Weather Condition</label>
            <select
              value={weatherCondition}
              onChange={(e) => setWeatherCondition(e.target.value)}
            >
              <option>Sunny</option>
              <option>Rainy</option>
              <option>Cloudy</option>
            </select>
          </div>

          <div>
            <label>Crop Type</label>
            <select value={cropType} onChange={(e) => setCropType(e.target.value)}>
              <option>Wheat</option>
              <option>Rice</option>
              <option>Maize</option>
            </select>
          </div>

          <div>
            <label>Region</label>
            <select value={region} onChange={(e) => setRegion(e.target.value)}>
              <option>North</option>
              <option>South</option>
              <option>East</option>
              <option>West</option>
            </select>
          </div>
        </div>

        <button className="predict-btn" onClick={handlePredict}>
          🔮 Predict Yield
        </button>

        <div className="result-box">
          <h2>Prediction Result</h2>
          <p>{prediction}</p>
        </div>
      </div>
    </div>
  );
}