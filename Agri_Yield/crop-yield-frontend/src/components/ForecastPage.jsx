import React, { useState } from 'react'
import axios from 'axios'

export default function ForecastPage() {
  const today2026 = new Date()
  today2026.setFullYear(2026)
  const defaultDate = today2026.toISOString().split('T')[0]

  const [formData, setFormData] = useState({
    startDate: defaultDate,
    horizon: 7,
    temperature: "",
    humidity: "",
    N: "",
    P: "",
    K: "",
    recent_yield: ""
  })

  const [forecast, setForecast] = useState([])
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setForecast([])

    try {
      const payload = {
        horizon: Number(formData.horizon),
        temperature: Array(7).fill(Number(formData.temperature)),
        humidity: Array(7).fill(Number(formData.humidity)),
        N: Array(7).fill(Number(formData.N)),
        P: Array(7).fill(Number(formData.P)),
        K: Array(7).fill(Number(formData.K)),
        recent_yield: formData.recent_yield
          ? formData.recent_yield.split(',').map(Number)
          : [25.0, 25.3, 25.6, 26.0, 26.3, 26.6, 27.0]
      }

      const res = await axios.post('http://127.0.0.1:8001/forecast', payload)

      if (res.data.error) {
        alert("Server error: " + res.data.error)
      } else {
        setForecast(res.data.forecast || [])
      }
    } catch (err) {
      alert('❌ Request failed: ' + err.message)
    }

    setLoading(false)
  }

  const handleDateChange = (e) => {
    const selected = e.target.value
    const year = new Date(selected).getFullYear()
    if (year === 2026) {
      setFormData({ ...formData, startDate: selected })
    } else {
      alert("⚠️ Please choose a date within the year 2026.")
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">7-Day Crop Yield Forecast</h1>
      <form onSubmit={handleSubmit} className="space-y-4 text-left">

        <label className="block">
          <span className="text-gray-700">Select Start Date (2026)</span>
          <input
            type="date"
            name="startDate"
            className="mt-1 p-2 border w-full rounded"
            value={formData.startDate}
            onChange={handleDateChange}
            required
          />
        </label>

        <label className="block">
          <span className="text-gray-700">Temperature (°C)</span>
          <input
            type="number"
            name="temperature"
            className="mt-1 p-2 border w-full rounded"
            placeholder="e.g. 26"
            onChange={handleChange}
            required
          />
        </label>

        <label className="block">
          <span className="text-gray-700">Humidity (%)</span>
          <input
            type="number"
            name="humidity"
            className="mt-1 p-2 border w-full rounded"
            placeholder="e.g. 70"
            onChange={handleChange}
            required
          />
        </label>

        <label className="block">
          <span className="text-gray-700">Nutrient Values (N, P, K)</span>
          <div className="flex space-x-2 mt-1">
            <input type="number" name="N" placeholder="N" className="p-2 border w-1/3 rounded" onChange={handleChange} required />
            <input type="number" name="P" placeholder="P" className="p-2 border w-1/3 rounded" onChange={handleChange} required />
            <input type="number" name="K" placeholder="K" className="p-2 border w-1/3 rounded" onChange={handleChange} required />
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700">Recent Yield (comma-separated)</span>
          <input
            type="text"
            name="recent_yield"
            className="mt-1 p-2 border w-full rounded"
            placeholder="Optional: 25.3,26.1,26.8,27.0,..."
            onChange={handleChange}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          {loading ? "Predicting..." : "Get 7-Day Forecast"}
        </button>
      </form>

      {Array.isArray(forecast) && forecast.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Forecast Results (from {formData.startDate}):
          </h2>
          <ul className="bg-gray-50 p-4 rounded border text-gray-700">
            {forecast.map((value, i) => (
              <li key={i}>Day {i + 1}: <strong>{value.toFixed(2)}</strong> tons/ha</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
