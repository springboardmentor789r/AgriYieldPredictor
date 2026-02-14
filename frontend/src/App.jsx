import React, { useState } from "react";
import "./index.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";

export default function App() {
  const initialState = {
    temperature: "",
    rainfall: "",
    humidity: "",
    soil: "clay",
    weather: "Cloudy",
    crop: "barley",
  };

  const [form, setForm] = useState(initialState);
  const [date, setDate] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = (e) => {
    e.preventDefault();
    setForm(initialState);
    setPredictions([]);
    setPredictionData(null);
  };

  // Predict based on conditions
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop_type: form.crop,
          soil_type: form.soil,
          weather_condition: form.weather,
          temperature: parseFloat(form.temperature),
          rainfall: parseFloat(form.rainfall),
          humidity: parseFloat(form.humidity),
        }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      
      // Create a single prediction point for today
      const today = new Date().toISOString().split('T')[0];
      setPredictions([{ 
        date: today, 
        predicted_yield: data.predicted_yield,
        confidence_lower: data.predicted_yield - 2,
        confidence_upper: data.predicted_yield + 2
      }]);
      
      setPredictionData({
        type: 'single',
        average_yield: data.predicted_yield,
        trend: 'static'
      });
    } catch (error) {
      console.error("Error while submitting form:", error);
      alert("Something went wrong. Check console.");
    } finally {
      setLoading(false);
    }
  };

  // Predict yield by date (next 10 days)
  const handleDatePrediction = async (e) => {
    e.preventDefault();
    if (!date) {
      alert("Please select a date");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/predict_by_date", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      console.log("Date Prediction response:", data);

      // Set predictions for chart
      setPredictions(data.predictions);
      setPredictionData({
        type: 'timeline',
        average_yield: data.average_yield,
        trend: data.trend,
        prediction_start_date: data.prediction_start_date,
        last_training_date: data.last_training_date
      });
    } catch (error) {
      console.error("Error while predicting by date:", error);
      alert("Something went wrong with date prediction.");
    } finally {
      setLoading(false);
    }
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`Date: ${label}`}</p>
          <p className="text-indigo-600">{`Yield: ${payload[0].value.toFixed(2)}`}</p>
          {payload[0].payload.confidence_lower && (
            <p className="text-sm text-gray-600">
              Confidence: {payload[0].payload.confidence_lower.toFixed(2)} - {payload[0].payload.confidence_upper.toFixed(2)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            🌾 Crop Yield Predictor
          </h1>
          <p className="text-gray-600">Predict crop yields using machine learning</p>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Temperature */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🌡️ Temperature (°C)
            </label>
            <input
              name="temperature"
              type="number"
              placeholder="e.g. 25"
              value={form.temperature}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Rainfall */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🌧️ Rainfall (mm)
            </label>
            <input
              name="rainfall"
              type="number"
              placeholder="e.g. 12.5"
              value={form.rainfall}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Humidity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              💧 Humidity (%)
            </label>
            <input
              name="humidity"
              type="number"
              placeholder="e.g. 78"
              value={form.humidity}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Soil Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🏞️ Soil Type
            </label>
            <select
              name="soil"
              value={form.soil}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="Clay">Clay</option>
              <option value="Loamy">Loamy</option>
              <option value="Peaty">Peaty</option>
              <option value="Sandy">Sandy</option>
              <option value="Silty">Silty</option>
            </select>
          </div>

          {/* Weather */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ☁️ Weather
            </label>
            <select
              name="weather"
              value={form.weather}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="Cloudy">Cloudy</option>
              <option value="Rainy">Rainy</option>
              <option value="Stormy">Stormy</option>
              <option value="Sunny">Sunny</option>
            </select>
          </div>

          {/* Crop Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🌱 Crop Type
            </label>
            <select
              name="crop"
              value={form.crop}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="Barley">Barley</option>
              <option value="Corn">Corn</option>
              <option value="Rice">Rice</option>
              <option value="Soyabeans">Soyabeans</option>
              <option value="Wheat">Wheat</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="lg:col-span-3 flex justify-center gap-4 mt-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 rounded-xl border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold"
            >
              🔄 Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "⏳ Predicting..." : "🚀 Predict Yield"}
            </button>
          </div>
        </form>

        {/* Date Prediction Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6 mb-8 border border-green-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            📅 Predict Next 10 Days Yield
          </h2>
          <form onSubmit={handleDatePrediction} className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <div className="flex-1 max-w-md">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-green-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? "⏳ Forecasting..." : "🌾 Predict Timeline"}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {predictionData && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {predictionData.average_yield?.toFixed(2) || predictions[0]?.predicted_yield?.toFixed(2)}
                </div>
                <div className="text-sm text-blue-800 font-semibold">Average Yield</div>
              </div>
              
              <div className={`rounded-2xl p-6 border text-center ${
                predictionData.trend === 'increasing' 
                  ? 'bg-green-50 border-green-200' 
                  : predictionData.trend === 'decreasing'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="text-2xl font-bold mb-2">
                  {predictionData.trend === 'increasing' ? '📈' : 
                   predictionData.trend === 'decreasing' ? '📉' : '➡️'}
                </div>
                <div className={`text-sm font-semibold ${
                  predictionData.trend === 'increasing' ? 'text-green-800' :
                  predictionData.trend === 'decreasing' ? 'text-red-800' :
                  'text-gray-800'
                }`}>
                  {predictionData.trend ? predictionData.trend.charAt(0).toUpperCase() + predictionData.trend.slice(1) : 'Stable'}
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {predictions.length}
                </div>
                <div className="text-sm text-purple-800 font-semibold">Days Predicted</div>
              </div>
            </div>

            {/* Chart */}
            {predictions.length > 1 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                  📊 Yield Forecast Timeline
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={predictions}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#6b7280' }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fill: '#6b7280' }}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <defs>
                        <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="predicted_yield"
                        stroke="#4F46E5"
                        strokeWidth={3}
                        fill="url(#yieldGradient)"
                        dot={{ r: 4, fill: "#4F46E5" }}
                        activeDot={{ r: 6, fill: "#3730a3" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Prediction Tiles */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                🗓️ Daily Predictions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {predictions.map((prediction, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100 hover:shadow-md transition-all"
                  >
                    <div className="text-center">
                      <div className="text-sm font-semibold text-indigo-700 mb-1">
                        {prediction.date}
                      </div>
                      <div className="text-2xl font-bold text-gray-800 mb-2">
                        {prediction.predicted_yield.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-600">
                        Yield
                      </div>
                      {prediction.confidence_lower && (
                        <div className="text-xs text-gray-500 mt-2">
                          ±{((prediction.confidence_upper - prediction.confidence_lower)/2).toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Single Prediction Display */}
        {predictions.length === 1 && predictionData && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Predicted Yield</h3>
            <div className="text-5xl font-bold mb-4">
              {predictions[0].predicted_yield.toFixed(2)}
            </div>
            <p className="text-indigo-100">
              Based on current conditions for {form.crop}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

