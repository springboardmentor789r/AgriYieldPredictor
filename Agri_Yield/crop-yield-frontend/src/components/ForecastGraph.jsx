import React, { useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ForecastGraph() {
  const [forecastData, setForecastData] = useState(null);
  const [formData, setFormData] = useState({
    temperature: "",
    humidity: "",
    N: "",
    P: "",
    K: "",
    recent_yield: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        horizon: 7,
        temperature: [Number(formData.temperature)],
        humidity: [Number(formData.humidity)],
        N: [Number(formData.N)],
        P: [Number(formData.P)],
        K: [Number(formData.K)],
        recent_yield: formData.recent_yield
          ? formData.recent_yield.split(",").map(Number)
          : [25, 26, 27, 28, 28.5, 29, 30, 30.5, 31, 31.5],
      };

      const res = await axios.post("http://127.0.0.1:8001/forecast", payload);
      const fc = res.data.forecast.map((val, i) => ({
        day: `Day ${i + 1}`,
        yield: Math.max(val, 0), // avoid negatives
      }));
      setForecastData(fc);
    } catch (err) {
      alert("Error fetching forecast: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-green-700 mb-4">📊 Crop Yield Forecast Graph</h1>
      <p className="text-sm text-gray-500 mb-4">
        Enter environmental parameters to visualize a 7-day crop yield forecast.
      </p>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-6">
        <input
          type="number"
          name="temperature"
          placeholder="Temperature (°C)"
          value={formData.temperature}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="number"
          name="humidity"
          placeholder="Humidity (%)"
          value={formData.humidity}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="number"
          name="N"
          placeholder="N"
          value={formData.N}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="number"
          name="P"
          placeholder="P"
          value={formData.P}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="number"
          name="K"
          placeholder="K"
          value={formData.K}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          name="recent_yield"
          placeholder="Recent Yield (comma-separated)"
          value={formData.recent_yield}
          onChange={handleChange}
          className="p-2 border rounded col-span-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="col-span-2 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          {loading ? "Generating..." : "Show Forecast Graph"}
        </button>
      </form>

      {forecastData && (
        <div className="mt-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="yield" stroke="#16a34a" strokeWidth={3} dot={true} />
            </LineChart>
          </ResponsiveContainer>

          <p className="text-center mt-3 text-sm text-gray-600">
            7-Day Forecast Visualization (tons/ha)
          </p>
        </div>
      )}
    </div>
  );
}
