import { useState } from "react";
import axios from "axios";
import "./App.css";

export default function Home() {
  const [formData, setFormData] = useState({
    soil_type: "",
    crop_type: "",
    region: "",
    temperature: "",
    rainfall: "",
  });

  const [predictedYield, setPredictedYield] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setPredictedYield(null);

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
      const response = await axios.post("http://localhost:8000/predict", {
        region: formData.region,
        soil_type: formData.soil_type,
        crop_type: formData.crop_type,
        temperature: Number(formData.temperature),
        rainfall_mm: Number(formData.rainfall),
        fertilizer_used: 0,
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
      <div className="form-box1">
        <h1>🌱 Soil & Crop Details Form</h1>
        <form onSubmit={handleSubmit}>
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

        {predictedYield !== null && (
          <div
            className="predicted-box"
            style={{
              marginTop: "20px",
              padding: "20px",
              borderRadius: "12px",
              background: "linear-gradient(to right, #ffecd2, #fcb69f)",
              boxShadow: "0 4px 15px rgba(0,0,0,0.25)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              maxWidth: "700px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <h2 style={{ margin: 0, color: "#d84315" }}>Predicted Yield</h2>
            <span
              style={{
                fontSize: "1.8rem",
                fontWeight: "700",
                color: "#2e7d32",
              }}
            >
              {predictedYield}
            </span>
          </div>
        )}

        {predictedYield !== null && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              borderRadius: "10px",
              background: "#e8f5e9",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              maxWidth: "700px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <h3 style={{ marginBottom: "10px", color: "#2e7d32" }}>Input Details</h3>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ background: "#4caf50", color: "#fff" }}>
                  <th style={{ padding: "10px", border: "1px solid #ddd" }}>Input</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd" }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(formData).map(([key, value], idx) => (
                  <tr
                    key={idx}
                    style={{
                      background: idx % 2 === 0 ? "#f1f8e9" : "#e8f5e9",
                    }}
                  >
                    <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontWeight: "600",
                      }}
                    >
                      {key.replace("_", " ").toUpperCase()}
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
