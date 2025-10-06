import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const DEFAULTS = {
  Rainfall_mm: '',
  Temperature_Celsius: '',
  Days_to_Harvest: '',
  Fertilizer_Used: false,
  Irrigation_Used: false,
  Region: '',
  Soil_Type: '',
  Crop: '',
  Weather_Condition: '',
}

export default function PredictForm() {
  const [form, setForm] = useState(DEFAULTS)
  const [cats, setCats] = useState({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await axios.get(`${API_BASE}/categories`)
        setCats(res.data)
        setForm((prev) => ({
          ...prev,
          Region: prev.Region || (res.data.Region?.[0] || ''),
          Soil_Type: prev.Soil_Type || (res.data.Soil_Type?.[0] || ''),
          Crop: prev.Crop || (res.data.Crop?.[0] || ''),
          Weather_Condition: prev.Weather_Condition || (res.data.Weather_Condition?.[0] || ''),
        }))
      } catch (e) {
        console.error(e)
        setError('Failed to load categories')
      }
    }
    fetchCategories()
  }, [])

 
  function handleChange(e) {
    const { name, value } = e.target
    if (name === 'Fertilizer_Used' || name === 'Irrigation_Used') {
      setForm((f) => ({ ...f, [name]: value === 'true' }))
      return
    }
    setForm((f) => ({ ...f, [name]: value }))
  }

  
  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setResult(null)

    try {
      const payload = {
        Rainfall_mm: parseFloat(form.Rainfall_mm),
        Temperature_Celsius: parseFloat(form.Temperature_Celsius),
        Days_to_Harvest: parseFloat(form.Days_to_Harvest),
        Fertilizer_Used: Boolean(form.Fertilizer_Used),
        Irrigation_Used: Boolean(form.Irrigation_Used),
        Region: form.Region,
        Soil_Type: form.Soil_Type,
        Crop: form.Crop,
        Weather_Condition: form.Weather_Condition,
      }

      if (
        Number.isNaN(payload.Rainfall_mm) ||
        Number.isNaN(payload.Temperature_Celsius) ||
        Number.isNaN(payload.Days_to_Harvest)
      ) {
        setError('Please fill numeric fields with valid numbers')
        return
      }

      setLoading(true)
      const res = await axios.post(`${API_BASE}/predict`, payload, {
        headers: { 'Content-Type': 'application/json' },
      })

      
      setResult(res.data.predicted_yield_tons_per_hectare)
    } catch (err) {
      console.error(err)
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        'Prediction failed'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Rainfall (mm)</span>
          <input
            name="Rainfall_mm"
            value={form.Rainfall_mm}
            onChange={handleChange}
            type="number"
            step="any"
            className="mt-1 p-2 border rounded"
            required
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Temperature (°C)</span>
          <input
            name="Temperature_Celsius"
            value={form.Temperature_Celsius}
            onChange={handleChange}
            type="number"
            step="any"
            className="mt-1 p-2 border rounded"
            required
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Days to harvest</span>
          <input
            name="Days_to_Harvest"
            value={form.Days_to_Harvest}
            onChange={handleChange}
            type="number"
            step="1"
            className="mt-1 p-2 border rounded"
            required
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Fertilizer used</span>
          <select
            name="Fertilizer_Used"
            value={String(form.Fertilizer_Used)}
            onChange={handleChange}
            className="mt-1 p-2 border rounded"
          >
            <option value={false}>False</option>
            <option value={true}>True</option>
          </select>
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Irrigation used</span>
          <select
            name="Irrigation_Used"
            value={String(form.Irrigation_Used)}
            onChange={handleChange}
            className="mt-1 p-2 border rounded"
          >
            <option value={false}>False</option>
            <option value={true}>True</option>
          </select>
        </label>

        <div />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Region</span>
          <select
            name="Region"
            value={form.Region}
            onChange={handleChange}
            className="mt-1 p-2 border rounded"
          >
            {(cats.Region || []).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Soil Type</span>
          <select
            name="Soil_Type"
            value={form.Soil_Type}
            onChange={handleChange}
            className="mt-1 p-2 border rounded"
          >
            {(cats.Soil_Type || []).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col md:col-span-1">
          <span className="text-sm text-gray-600">Crop</span>
          <select
            name="Crop"
            value={form.Crop}
            onChange={handleChange}
            className="mt-1 p-2 border rounded"
          >
            {(cats.Crop || []).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col md:col-span-1">
          <span className="text-sm text-gray-600">Weather</span>
          <select
            name="Weather_Condition"
            value={form.Weather_Condition}
            onChange={handleChange}
            className="mt-1 p-2 border rounded"
          >
            {(cats.Weather_Condition || []).map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded shadow-sm hover:bg-green-700 disabled:opacity-70"
        >
          {loading ? 'Predicting...' : 'Predict'}
        </button>

        <button
          type="button"
          onClick={() => {
            setForm(DEFAULTS)
            setResult(null)
            setError(null)
          }}
          className="px-3 py-2 border rounded text-sm"
        >
          Reset
        </button>

        {error && <div className="text-red-600 text-sm">{error}</div>}
      </div>

      {result !== null && (
        <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded">
          <div className="text-sm text-gray-600">Predicted yield</div>
          <div className="text-2xl font-semibold text-green-800">
            {Number(result).toFixed(4)} tons / ha
          </div>
        </div>
      )}
    </form>
  )
}
