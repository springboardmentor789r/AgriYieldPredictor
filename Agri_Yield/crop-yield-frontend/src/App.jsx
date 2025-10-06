import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import PredictForm from './components/PredictForm'
import ForecastPage from './components/ForecastPage'
import ForecastGraph from './components/ForecastGraph' // ✅ new page

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-6">
        <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-8">
          
          {/* 🌿 Header with navigation */}
          <header className="mb-6 flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">
              Smart Crop AI Dashboard
            </h1>

            <nav className="space-x-4 text-center">
              <Link
                to="/"
                className="text-green-700 hover:text-green-900 font-medium transition"
              >
                🌾 Yield Predictor
              </Link>
              <Link
                to="/forecast"
                className="text-green-700 hover:text-green-900 font-medium transition"
              >
                🌤 7-Day Forecast
              </Link>
              <Link
                to="/forecast-graph"
                className="text-green-700 hover:text-green-900 font-medium transition"
              >
                📊 Forecast Graph
              </Link>
            </nav>
          </header>

          {/* 🧭 Routes */}
          <Routes>
            <Route path="/" element={<PredictForm />} />
            <Route path="/forecast" element={<ForecastPage />} />
            <Route path="/forecast-graph" element={<ForecastGraph />} /> {/* ✅ new route */}
          </Routes>

          
        </div>
      </div>
    </Router>
  )
}
