import { useState } from "react";
import axios from "axios"; 
import "./CropForm.css";

function CropForm() {
  const [formData, setFormData] = useState({
    Temperature: "",
    Rainfall: "",
    Humidity: "",
    Soil_Type: "",
    Weather_Condition: "",
    Crop_Type: "",
  });

  const [prediction, setPrediction] = useState(null); // ⬅️ holds backend response
  const [loading, setLoading] = useState(false); // optional loading state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);

    try {
      // Axios POST call
      const response = await axios.post("http://127.0.0.1:8000/predict", formData);

      if (response.data.predicted_yield !== undefined) {
        setPrediction(response.data.predicted_yield); // set predicted value
      } else if (response.data.error) {
        setPrediction(`Error: ${response.data.error}`);
      }
    } catch (err) {
      setPrediction("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", display: "flex", justifyContent: "center" }}>
      <form onSubmit={handleSubmit} style={{ width: "400px" }}>
        <label>
          Temperature (°C):
          <input
            type="number"
            step="0.1"
            name="Temperature"
            value={formData.Temperature}
            onChange={handleChange}
          />
        </label>
        <br />

        <label>
          Rainfall (mm):
          <input
            type="number"
            step="0.1"
            name="Rainfall"
            value={formData.Rainfall}
            onChange={handleChange}
          />
        </label>
        <br />

        <label>
          Humidity (%):
          <input
            type="number"
            step="0.1"
            name="Humidity"
            value={formData.Humidity}
            onChange={handleChange}
          />
        </label>
        <br />

        <label>
          Soil Type:
          <select
            name="Soil_Type"
            value={formData.Soil_Type}
            onChange={handleChange}
          >
            <option value="">Select Soil Type</option>
            <option value="Sandy">Sandy</option>
            <option value="Loamy">Loamy</option>
            <option value="Peaty">Peaty</option>
            <option value="Clay">Clay</option>
            <option value="Silty">Silty</option>
          </select>
        </label>
        <br />

        <label>
          Weather Condition:
          <select
            name="Weather_Condition"
            value={formData.Weather_Condition}
            onChange={handleChange}
          >
            <option value="">Select Condition</option>
            <option value="Sunny">Sunny</option>
            <option value="Rainy">Rainy</option>
            <option value="Stormy">Stormy</option>
            <option value="Cloudy">Cloudy</option>
          </select>
        </label>
        <br />

        <label>
          Crop Type:
          <select
            name="Crop_Type"
            value={formData.Crop_Type}
            onChange={handleChange}
          >
            <option value="">Select Crop</option>
            <option value="Barley">Barley</option>
            <option value="Corn">Corn</option>
            <option value="Wheat">Wheat</option>
            <option value="Soybeans">Soybeans</option>
            <option value="Rice">Rice</option>
          </select>
        </label>
        <br />

        <button type="submit">{loading ? "Predicting..." : "Submit Data"}</button>

        {/* 🔽 This shows the prediction below the button */}
        {prediction && (
  <div className="prediction-box">
    Predicted Yield: {prediction}
  </div>
)}

      </form>
    </div>
  );
}

export default CropForm;
