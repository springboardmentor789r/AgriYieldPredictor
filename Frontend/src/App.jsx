import { useState, useEffect, useRef } from "react";
import Select from "react-select";
import axios from "axios";

function App() {
  const [activeTab, setActiveTab] = useState("prediction"); // "prediction" | "forecast"

  // ---------------- STATES ----------------
  const [formData, setFormData] = useState({
    temperature: "",
    rainfall: "",
    humidity: "",
    soil_type: "",
    weather_condition: "",
    crop_type: "",
  });

  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [showError, setShowError] = useState(false);

  const [cropOptions, setCropOptions] = useState([]);
  const [soilOptions, setSoilOptions] = useState([]);
  const [weatherOptions, setWeatherOptions] = useState([]);

  // Refs for navigation
  const rainfallRef = useRef(null);
  const humidityRef = useRef(null);
  const soilRef = useRef(null);
  const weatherRef = useRef(null);
  const cropRef = useRef(null);
  const submitRef = useRef(null);

  // --- FORECAST ---
  const [forecastDate, setForecastDate] = useState("");
  const [forecastResult, setForecastResult] = useState(null);
  const [forecastError, setForecastError] = useState("");
  const [forecastLoading, setForecastLoading] = useState(false);
  const forecastDateRef = useRef(null);

  // Fetch dropdowns
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const cropRes = await axios.get("http://127.0.0.1:8000/crop-types");
        const soilRes = await axios.get("http://127.0.0.1:8000/soil-types");
        const weatherRes = await axios.get("http://127.0.0.1:8000/weather-conditions");

        setCropOptions(cropRes.data.crop_types.map((c) => ({ value: c, label: c })));
        setSoilOptions(soilRes.data.soil_types.map((s) => ({ value: s, label: s })));
        setWeatherOptions(weatherRes.data.weather_conditions.map((w) => ({ value: w, label: w })));
      } catch (error) {
        console.error("Error fetching dropdown options:", error);
      }
    };
    fetchOptions();
  }, []);

  // ---------------- Validation ----------------
  const validateField = (name, value) => {
    let message = "";
    if (name === "temperature" && value) {
      if (value < 10 || value > 50) message = "Temperature must be between 10 and 50 °C";
    }
    if (name === "rainfall" && value) {
      if (value < 1 || value > 1000) message = "Rainfall must be between 1 and 1000 mm";
    }
    if (name === "humidity" && value) {
      if (value < 30 || value > 100) message = "Humidity must be between 30 and 100 %";
    }
    return message;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setResult(null);
    setShowError(false);

    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleSelectChange = (field, selected, nextRef) => {
    setFormData({ ...formData, [field]: selected ? selected.value : "" });
    setResult(null);
    setShowError(false);
    if (selected && nextRef?.current) nextRef.current.focus();
  };

  const isFormComplete = () => {
    return (
      formData.temperature &&
      formData.rainfall &&
      formData.humidity &&
      formData.soil_type &&
      formData.weather_condition &&
      formData.crop_type &&
      !errors.temperature &&
      !errors.rainfall &&
      !errors.humidity
    );
  };

  // ---------------- Prediction Submit ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormComplete()) {
      setShowError(true);
      setResult(null);
      return;
    }
    setShowError(false);
    try {
      const response = await axios.post("http://127.0.0.1:8000/predict", {
        ...formData,
        temperature: parseFloat(formData.temperature),
        rainfall: parseFloat(formData.rainfall),
        humidity: parseFloat(formData.humidity),
      });
      setResult(response.data.predicted_yield.toFixed(2));
    } catch (error) {
      console.error(error);
      setResult(null);
    }
  };

  // ---------------- Forecast Handlers ----------------
  const handleForecastDateChange = (e) => {
    setForecastDate(e.target.value);
    setForecastError("");
    setForecastResult(null);
  };

  const handleForecastSubmit = async (e) => {
    e.preventDefault();
    setForecastError("");
    setForecastResult(null);
    if (!forecastDate) {
      setForecastError("Please enter a date (YYYY-MM-DD).");
      return;
    }
    setForecastLoading(true);
    try {
      const resp = await axios.post("http://127.0.0.1:8000/forecast", { date: forecastDate });
      setForecastResult(Array.isArray(resp.data) ? resp.data : null);
    } catch (err) {
      console.error("Forecast error:", err);
      const detail = err?.response?.data?.detail;
      setForecastError(detail ? String(detail) : "Forecast request failed. Check backend.");
    } finally {
      setForecastLoading(false);
    }
  };

  // ---------------- Helpers ----------------
  const handleKeyDown = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextRef?.current) nextRef.current.focus();
    }
  };

  const inputStyle = (error) => ({
    padding: "8px",
    border: `2px solid ${error ? "red" : "#ccc"}`,
    borderRadius: "5px",
    fontSize: "16px", // prevent zoom
    marginTop: "4px",
    backgroundColor: "#fffde7",
  });

  const selectStyle = (error) => ({
    control: (base) => ({
      ...base,
      minHeight: "40px",
      fontSize: "16px", // prevent zoom
      border: `2px solid ${error ? "red" : "#ccc"}`,
      borderRadius: "5px",
      backgroundColor: "#fffde7",
    }),
  });

  const labelStyle = { fontWeight: "bold", fontSize: "14px", marginBottom: "2px" };
  const errorStyle = { color: "red", fontSize: "12px", marginTop: "2px", marginBottom: "4px" };

  // ---------------- Render ----------------
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        background: "linear-gradient(135deg, #fff9c47c, #ffe0b22d)",
        fontFamily: "Segoe UI, sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "white",
          padding: "40px",
          borderRadius: "10px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
        }}
      >
        {/* Tab Headers */}
        <div style={{ display: "flex", marginBottom: "15px" }}>
          <button
            onClick={() => setActiveTab("prediction")}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              borderBottom: activeTab === "prediction" ? "3px solid #6a1b9a" : "1px solid #ccc",
              background: "transparent",
              fontWeight: activeTab === "prediction" ? "bold" : "normal",
              color: activeTab === "prediction" ? "#6a1b9a" : "#666",
              cursor: "pointer",
            }}
          >
            Prediction
          </button>
          <button
            onClick={() => setActiveTab("forecast")}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              borderBottom: activeTab === "forecast" ? "3px solid #1976d2" : "1px solid #ccc",
              background: "transparent",
              fontWeight: activeTab === "forecast" ? "bold" : "normal",
              color: activeTab === "forecast" ? "#1976d2" : "#666",
              cursor: "pointer",
            }}
          >
            Forecast
          </button>
        </div>

        {/* ---------------- Prediction Tab ---------------- */}
        {activeTab === "prediction" && (
          <div>
            <h1 style={{ textAlign: "center", color: "#6a1b9a", fontSize: "26px",marginBottom:"30px" }}>
              🌾 Crop Yield Predictor
            </h1>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <label style={labelStyle}>Temperature (°C)</label>
              <input
                type="number"
                name="temperature"
                placeholder="Enter temperature in °C"
                value={formData.temperature}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, rainfallRef)}
                style={inputStyle(errors.temperature || (showError && !formData.temperature))}
              />
              {errors.temperature && <div style={errorStyle}>{errors.temperature}</div>}

              <label style={labelStyle}>Rainfall (mm)</label>
              <input
                ref={rainfallRef}
                type="number"
                name="rainfall"
                placeholder="Enter rainfall in mm"
                value={formData.rainfall}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, humidityRef)}
                style={inputStyle(errors.rainfall || (showError && !formData.rainfall))}
              />
              {errors.rainfall && <div style={errorStyle}>{errors.rainfall}</div>}

              <label style={labelStyle}>Humidity (%)</label>
              <input
                ref={humidityRef}
                type="number"
                name="humidity"
                placeholder="Enter humidity in %"
                value={formData.humidity}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, soilRef)}
                style={inputStyle(errors.humidity || (showError && !formData.humidity))}
              />
              {errors.humidity && <div style={errorStyle}>{errors.humidity}</div>}

              <label style={labelStyle}>Soil Type</label>
              <Select
                ref={soilRef}
                options={soilOptions}
                placeholder="Select soil type"
                value={formData.soil_type ? { value: formData.soil_type, label: formData.soil_type } : null}
                onChange={(s) => handleSelectChange("soil_type", s, weatherRef)}
                styles={selectStyle(showError && !formData.soil_type)}
              />

              <label style={labelStyle}>Weather Condition</label>
              <Select
                ref={weatherRef}
                options={weatherOptions}
                placeholder="Select weather condition"
                value={formData.weather_condition ? { value: formData.weather_condition, label: formData.weather_condition } : null}
                onChange={(s) => handleSelectChange("weather_condition", s, cropRef)}
                styles={selectStyle(showError && !formData.weather_condition)}
              />

              <label style={labelStyle}>Crop Type</label>
              <Select
                ref={cropRef}
                options={cropOptions}
                placeholder="Select crop type"
                value={formData.crop_type ? { value: formData.crop_type, label: formData.crop_type } : null}
                onChange={(s) => handleSelectChange("crop_type", s, submitRef)}
                styles={selectStyle(showError && !formData.crop_type)}
              />

              <button
                ref={submitRef}
                type="submit"
                style={{
                  padding: "10px",
                  background: "#2e7d32",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                Predict Yield
              </button>
            </form>

            {showError && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "6px",
                  textAlign: "center",
                  background: "#ffebee",
                  color: "#c62828",
                  borderRadius: "5px",
                  border: "1px solid #ef9a9a",
                  fontWeight: "bold",
                }}
              >
                ⚠️ Please fill all fields before predicting!
              </div>
            )}

            {isFormComplete() && result && (
              <div
                style={{
                  marginTop: "15px",
                  textAlign: "center",
                  background: "#e8f5e9",
                  padding: "10px",
                  borderRadius: "7px",
                  border: "1px solid #c8e6c9",
                }}
              >
                <h2 style={{ color: "#2e7d32", margin: 0 }}>
                  Predicted Yield: {result} tons/hec
                </h2>
              </div>
            )}
          </div>
        )}

        {/* ---------------- Forecast Tab ---------------- */}
        {activeTab === "forecast" && (
          <div>
            <h1 style={{ textAlign: "center", fontSize: "26px", margin: "6px 0", color: "#1976d2" }}>
              Forecast
            </h1>
            <form onSubmit={handleForecastSubmit} style={{ display: "flex",justifyContent:"center", gap: "20px", marginTop: "35px" }}>
              <input
                ref={forecastDateRef}
                type="date"
                value={forecastDate}
                onChange={handleForecastDateChange}
                style={{
               
                  padding: "8px",
                  border: `2px solid ${forecastError ? "red" : "#ccc"}`,
                  borderRadius: "5px",
                  fontSize: "16px", // prevent zoom
                  backgroundColor: "#fffde7",
                }}
              />
              <button
                type="submit"
                style={{
                  
                  padding: "10px",
                  background: forecastLoading ? "#9e9e9e" : "#1976d2",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: forecastLoading ? "not-allowed" : "pointer",
                  fontSize: "16px",
                }}
                disabled={forecastLoading}
              >
                {forecastLoading ? "Loading..." : "Get Forecast"}
              </button>
            </form>

            {forecastError && <div style={{ marginTop: "8px", color: "red", fontSize: "14px" }}>{forecastError}</div>}

            {forecastResult && Array.isArray(forecastResult) && (
              <div style={{ marginTop: "12px", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "15px" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "6px", borderBottom: "1px solid #ddd" }}>Date</th>
                      <th style={{ textAlign: "right", padding: "6px", borderBottom: "1px solid #ddd" }}>Yield</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecastResult.map((row, idx) => {
                      const formattedDate = new Date(row.Date).toLocaleDateString("en-GB").replace(/\//g, "-");
                      return (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                          <td style={{ padding: "6px", borderBottom: "1px solid #eee" }}>{formattedDate}</td>
                          <td style={{ padding: "6px", textAlign: "right", borderBottom: "1px solid #eee" }}>
                            {typeof row.Yield === "number" ? row.Yield.toFixed(2) : String(row.Yield)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
