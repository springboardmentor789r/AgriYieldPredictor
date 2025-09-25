import { useState } from "react";
import "./App.css";
import axios from "axios";

export default function App() {
  const [formData, setFormData] = useState({
    soil_type: "",
    crop_type: "",
    region: "",
    temperature: "",
    rainfall: "",
  });

  const [predictedYield, setPredictedYield] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setPredictedYield(null);

    // ✅ simple validation
    if (
      !formData.soil_type ||
      !formData.crop_type ||
      !formData.region ||
      !formData.temperature ||
      !formData.rainfall
    ) {
      setErrorMsg("Please fill all fields.");
      return;
    }

    try {
      // ✅ Send data to FastAPI backend
      const response = await axios.post("http://localhost:8000/predict", {
        region: formData.region,
        soil_type: formData.soil_type,
        crop_type: formData.crop_type,
        temperature: Number(formData.temperature),
        rainfall_mm: Number(formData.rainfall),
        fertilizer_used: 0, // default for now
        irrigation_used: 0,
        weather_condition: "Normal",
        days_to_harvest: 90,
      });

      setPredictedYield(response.data.predicted_yield);
    } catch (error) {
      setErrorMsg(error.response?.data?.detail || error.message);
    }
  };

  return (
    <div className="container">
      <div className="form-box">
        <h1>🌱 Soil & Crop Details Form</h1>
        <form onSubmit={handleSubmit}>
          {/* Soil Type */}
          <div className="form-group">
            <label>Soil Type</label>
            <input
              type="text"
              name="soil_type"
              placeholder="Enter soil type (e.g., Loamy)"
              value={formData.soil_type}
              onChange={handleChange}
              required
            />
          </div>

          {/* Crop */}
          <div className="form-group">
            <label>Crop</label>
            <input
              type="text"
              name="crop_type"
              placeholder="Enter crop (e.g., Wheat)"
              value={formData.crop_type}
              onChange={handleChange}
              required
            />
          </div>

          {/* Region */}
          <div className="form-group">
            <label>Region</label>
            <input
              type="text"
              name="region"
              placeholder="Enter region (e.g., Punjab)"
              value={formData.region}
              onChange={handleChange}
              required
            />
          </div>

          {/* Temperature */}
          <div className="form-group">
            <label>Temperature (°C)</label>
            <input
              type="number"
              name="temperature"
              placeholder="Enter temperature"
              value={formData.temperature}
              onChange={handleChange}
              required
            />
          </div>

          {/* Rainfall */}
          <div className="form-group">
            <label>Rainfall (mm)</label>
            <input
              type="number"
              name="rainfall"
              placeholder="Enter rainfall in mm"
              value={formData.rainfall}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit">🚀 Predict Yield</button>
        </form>

        {/* ✅ Prediction Result */}
        {predictedYield !== null && (
          <div className="result">
            <h2>✅ Predicted Yield: {predictedYield}</h2>
          </div>
        )}

        {/* ❌ Error Message */}
        {errorMsg && (
          <div className="error">
            <h3>Error</h3>
            <p>{errorMsg}</p>
          </div>
        )}
      </div>
    </div>
  );
}
