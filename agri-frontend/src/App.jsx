import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import "./App.css";

export default function App() {
  const [yieldResult, setYieldResult] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("predict");

  const [form, setForm] = useState({
    Crop_Type: "Wheat",
    Soil_Type: "Loamy",
    Temperature: "",
    Rainfall: "",
    Humidity: "",
    previous_yields: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  async function handlePredict(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setYieldResult(null);
    try {
      const payload = {
        Temperature: parseFloat(form.Temperature),
        Rainfall: parseFloat(form.Rainfall),
        Humidity: parseFloat(form.Humidity),
        Soil_Type: form.Soil_Type,
        Weather_Condition: "Sunny",
        Crop_Type: form.Crop_Type,
      };

      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setYieldResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForecast() {
    setError("");
    setForecastData(null);
    setLoading(true);
    try {
      const yields = form.previous_yields
        .split(",")
        .map((v) => parseFloat(v.trim()))
        .filter((v) => !isNaN(v));

      const payload = {
        Crop_Type: form.Crop_Type,
        Soil_Type: form.Soil_Type,
        previous_yields: yields,
        current_date: new Date().toISOString().split("T")[0],
      };

      const res = await fetch(
        "http://127.0.0.1:8000/timeseries/environment_forecast",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setForecastData(data);

      setTimeout(() => {
        const el = document.getElementById("forecast-table");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const chartData = forecastData?.timeline
    ? forecastData.timeline.map((d) => ({
        date: d.date,
        predicted: Number(d.predicted_yield),
      }))
    : [];

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1 className="main-title">🌾 Agri Yield Predictor</h1>
        <p className="subtitle">AI-driven Forecast & Crop Yield Insights</p>
      </div>

      <div className="tabs">
        <button
          className={`tab-btn ${tab === "predict" ? "active" : ""}`}
          onClick={() => setTab("predict")}
        >
          🔮 Predict Yield
        </button>
        <button
          className={`tab-btn ${tab === "forecast" ? "active" : ""}`}
          onClick={() => setTab("forecast")}
        >
          📈 7-Day Forecast
        </button>
        <button
          className={`tab-btn ${tab === "plot" ? "active" : ""}`}
          onClick={() => setTab("plot")}
        >
          📊 Forecast Plot
        </button>
      </div>

      {/* ---------- SECTION 1: NORMAL PREDICTION ---------- */}
      {tab === "predict" && (
        <section className="card glass">
          <h2>Normal Yield Prediction</h2>
          <form className="form" onSubmit={handlePredict}>
            <div className="inputs-row">
              <InputField
                label="Temperature (°C)"
                name="Temperature"
                value={form.Temperature}
                onChange={handleChange}
              />
              <InputField
                label="Rainfall (mm)"
                name="Rainfall"
                value={form.Rainfall}
                onChange={handleChange}
              />
              <InputField
                label="Humidity (%)"
                name="Humidity"
                value={form.Humidity}
                onChange={handleChange}
              />
            </div>

            <div className="inputs-row">
              <SelectField
                label="Soil Type"
                name="Soil_Type"
                value={form.Soil_Type}
                options={["Sandy", "Loamy", "Clay", "Peaty", "Silty"]}
                onChange={handleChange}
              />
              <SelectField
                label="Crop Type"
                name="Crop_Type"
                value={form.Crop_Type}
                options={["Wheat", "Corn", "Barley", "Rice", "Soybeans"]}
                onChange={handleChange}
              />
            </div>

            <button className="btn primary" disabled={loading}>
              {loading ? "Predicting..." : "Predict Yield"}
            </button>
          </form>

          {error && <div className="error">{error}</div>}
          {yieldResult && (
            <div className="result-card fade-in">
              <h3>Predicted Yield</h3>
              <p className="big-value">
                {yieldResult.predicted_yield.toFixed(2)}
              </p>
              <span className="unit">tons / hectare</span>
            </div>
          )}
        </section>
      )}

      {/* ---------- SECTION 2: FORECAST TABLE & SMALL CHART ---------- */}
      {tab === "forecast" && (
        <section className="card glass" id="forecast-table">
          <h2>7-Day Forecast</h2>

          <div className="inputs-row">
            <SelectField
              label="Crop Type"
              name="Crop_Type"
              value={form.Crop_Type}
              options={["Wheat", "Corn", "Barley", "Rice", "Soybeans"]}
              onChange={handleChange}
            />
            <SelectField
              label="Soil Type"
              name="Soil_Type"
              value={form.Soil_Type}
              options={["Sandy", "Loamy", "Clay", "Peaty", "Silty"]}
              onChange={handleChange}
            />
          </div>

          <InputField
            label="Previous Yields (comma separated)"
            name="previous_yields"
            value={form.previous_yields}
            onChange={handleChange}
          />

          <button
            className="btn primary"
            onClick={handleForecast}
            disabled={loading}
            style={{ marginTop: 20 }}
          >
            {loading ? "Generating..." : "Generate 7-Day Forecast"}
          </button>

          {error && <div className="error">{error}</div>}

          {forecastData && (
            <div className="forecast-section fade-in">
              <div className="forecast-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Predicted Yield</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecastData.timeline.map((d, i) => (
                      <tr key={i}>
                        <td>{d.date}</td>
                        <td>{d.predicted_yield.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="forecast-chart small">
                <h3>Forecast Visualization</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#163549" />
                    <XAxis dataKey="date" stroke="#9fb8d6" />
                    <YAxis stroke="#9fb8d6" />
                    <Tooltip
                      contentStyle={{
                        background: "#07192a",
                        border: "1px solid rgba(0,255,209,0.12)",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#00ffd1"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ---------- SECTION 3: MULTIVARIATE FORECAST PLOT ---------- */}
      {tab === "plot" && (
        <section className="card glass">
          <h2>
            {form.Crop_Type} — Actual vs Predicted Yield (7-Day Forecast)
          </h2>

          <div
            className="plot-controls inputs-row"
            style={{ alignItems: "flex-start" }}
          >
            <div style={{ flex: 1 }}>
              <SelectField
                label="Crop Type"
                name="Crop_Type"
                value={form.Crop_Type}
                options={["Wheat", "Corn", "Barley", "Rice", "Soybeans"]}
                onChange={handleChange}
              />
            </div>
            <div style={{ width: 260 }}>
              <InputField
                label="Previous Yields (comma separated)"
                name="previous_yields"
                value={form.previous_yields}
                onChange={handleChange}
              />
            </div>
            <div style={{ display: "flex", alignItems: "end", gap: 10 }}>
              <button
                className="btn primary"
                onClick={handleForecast}
                disabled={loading}
                style={{ height: 46 }}
              >
                {loading ? "Generating..." : "Generate Plot"}
              </button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          <div className="big-forecast-chart-wrapper">
            {forecastData && forecastData.timeline && forecastData.timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={420}>
                <LineChart
                  data={(() => {
                    const actualPoints = form.previous_yields
                      .split(",")
                      .map((v, i) => ({
                        date: `Prev-${i + 1}`,
                        actual_yield: parseFloat(v.trim()),
                      }))
                      .filter((p) => !isNaN(p.actual_yield));

                    const forecastPoints = forecastData.timeline.map((f) => ({
                      date: f.date,
                      predicted_yield: f.predicted_yield,
                    }));

                    return [...actualPoints, ...forecastPoints];
                  })()}
                  margin={{ top: 20, right: 40, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#13324b" />
                  <XAxis dataKey="date" stroke="#bcd9ff" />
                  <YAxis stroke="#bcd9ff" />
                  <Tooltip
                    contentStyle={{
                      background: "#07192a",
                      border: "1px solid rgba(0,255,209,0.12)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actual_yield"
                    stroke="#007bff"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#007bff" }}
                    name="Actual Yield"
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted_yield"
                    stroke="#00ffd1"
                    strokeDasharray="6 4"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#00ffd1" }}
                    name="Predicted Yield"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="placeholder">
                Generate a forecast to view Actual vs Predicted Yield plot.
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="footer">
        © 2025 Agri Yield Predictor — Built with 💚 by Johan Paul
      </footer>
    </div>
  );
}

// ---- Reusable components ----
function InputField({ label, name, value, onChange }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        className="neon"
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder="Enter value"
      />
    </div>
  );
}

function SelectField({ label, name, value, options, onChange }) {
  return (
    <div className="field">
      <label>{label}</label>
      <select className="neon" name={name} value={value} onChange={onChange}>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
