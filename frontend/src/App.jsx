import React, { useState } from "react";
import "./index.css"; // Make sure your Tailwind directives are in src/index.css

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = (e) => {
    e.preventDefault();
    setForm(initialState);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        crop_type: form.crop,
        soil_type: form.soil,
        weather_condition: form.weather,
        temperature: parseFloat(form.temperature),
        rainfall: parseFloat(form.rainfall),
        humidity: parseFloat(form.humidity),
      }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Prediction response:", data);

    alert(`Predicted Yield: ${data.predicted_yield}`);
  } catch (error) {
    console.error("Error while submitting form:", error);
    alert("Something went wrong. Check console.");
  }
};


  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-4">
          Let's Predict
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Temperature */}
          <div>
            <label htmlFor="temperature" className="block text-sm font-medium text-slate-700 mb-1">
              Temperature (°C)
            </label>
            <input
              id="temperature"
              name="temperature"
              type="number"
              inputMode="numeric"
              placeholder="e.g. 25"
              value={form.temperature}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* Rainfall */}
          <div>
            <label htmlFor="rainfall" className="block text-sm font-medium text-slate-700 mb-1">
              Rainfall (mm)
            </label>
            <input
              id="rainfall"
              name="rainfall"
              type="number"
              inputMode="decimal"
              placeholder="e.g. 12.5"
              value={form.rainfall}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* Humidity */}
          <div>
            <label htmlFor="humidity" className="block text-sm font-medium text-slate-700 mb-1">
              Humidity (%)
            </label>
            <input
              id="humidity"
              name="humidity"
              type="number"
              inputMode="numeric"
              placeholder="e.g. 78"
              value={form.humidity}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* Soil Type */}
          <div>
            <label htmlFor="soil" className="block text-sm font-medium text-slate-700 mb-1">
              Soil Type
            </label>
            <select
              id="soil"
              name="soil"
              value={form.soil}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="clay">Clay</option>
              <option value="loamy">Loamy</option>
              <option value="peaty">Peaty</option>
              <option value="sandy">Sandy</option>
              <option value="silty">Silty</option>
            </select>
          </div>

          {/* Weather */}
          <div>
            <label htmlFor="weather" className="block text-sm font-medium text-slate-700 mb-1">
              Weather
            </label>
            <select
              id="weather"
              name="weather"
              value={form.weather}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="Cloudy">Cloudy</option>
              <option value="Rainy">Rainy</option>
              <option value="stormy">Stormy</option>
              <option value="Sunny">Sunny</option>
            </select>
          </div>

          {/* Crop Type */}
          <div>
            <label htmlFor="crop" className="block text-sm font-medium text-slate-700 mb-1">
              Crop Type
            </label>
            <select
              id="crop"
              name="crop"
              value={form.crop}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="barley">Barley</option>
              <option value="corn">Corn</option>
              <option value="rice">Rice</option>
              <option value="soyabeans">Soyabeans</option>
              <option value="wheat">Wheat</option>
            </select>
          </div>

          {/* Buttons (span full width on small screens) */}
          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50"
            >
              Reset
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
