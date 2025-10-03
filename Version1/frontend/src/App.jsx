import React, { useState, useContext, createContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import "./App.css";

// Context for storing prediction history
const PredictionContext = createContext();
function PredictionProvider({ children }) {
  const [predictions, setPredictions] = useState([]);

  const addPrediction = (prediction) => {
    const newPrediction = {
      ...prediction,
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
    };
    setPredictions((prev) => [newPrediction, ...prev]);
  };

  const clearPredictions = () => setPredictions([]);

  return (
    <PredictionContext.Provider value={{ predictions, addPrediction, clearPredictions }}>
      {children}
    </PredictionContext.Provider>
  );
}

// Navigation Bar
function NavBar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">🌾 AgriYield Predictor</Link>
        <ul className="navbar-nav">
          <li><Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>🏠 Home</Link></li>
          <li><Link to="/predict" className={`nav-link ${isActive('/predict') ? 'active' : ''}`}>🔮 Predict</Link></li>
          <li><Link to="/trend" className={`nav-link ${isActive('/trend') ? 'active' : ''}`}>📈 Trend</Link></li>
          <li><Link to="/results" className={`nav-link ${isActive('/results') ? 'active' : ''}`}>🎯 Insights</Link></li>
        </ul>
      </div>
    </nav>
  );
}

// Home Page
function Home() {
  return (
    <div className="page">
      <div className="container">
        <div className="hero-section">
          <h1 className="hero-title">AgriYield Predictor</h1>
          <p className="hero-subtitle">Revolutionizing agriculture with AI-powered crop yield predictions using environmental and soil data</p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/predict" className="btn btn-primary">🔮 Start Predicting</Link>
            <Link to="/trend" className="btn btn-secondary">📈 Trend Analysis</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Predict Form (local simulation to avoid breaking other features)
function PredictForm() {
  const { addPrediction } = useContext(PredictionContext);
  const [formData, setFormData] = useState({ temperature: "", rainfall: "", humidity: "", soilType: "Sandy", weather: "Sunny", cropType: "Rice" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    setTimeout(() => {
      const baseYield = 3.2;
      const tempFactor = (parseFloat(formData.temperature) - 25) * 0.05 || 0;
      const rainFactor = (parseFloat(formData.rainfall) - 100) * 0.01 || 0;
      const humidityFactor = (parseFloat(formData.humidity) - 60) * 0.02 || 0;
      const soilMultipliers = { Sandy: 0.9, Loamy: 1.2, Peaty: 1.1, Clay: 0.95, Silty: 1.05 };
      const weatherMultipliers = { Sunny: 1.1, Rainy: 0.95, Stormy: 0.8, Cloudy: 1.0 };
      const soilMultiplier = soilMultipliers[formData.soilType] || 1;
      const weatherMultiplier = weatherMultipliers[formData.weather] || 1;
      const predictedYield = Math.max(0.5, (baseYield + tempFactor + rainFactor + humidityFactor) * soilMultiplier * weatherMultiplier + (Math.random() - 0.5) * 0.3);
      const predictionResult = {
        yield: predictedYield.toFixed(2),
        confidence: "±0.3",
        formData: { ...formData },
        factors: {
          temperature: tempFactor > 0 ? "Positive" : "Negative",
          rainfall: rainFactor > 0 ? "Positive" : "Negative",
          humidity: humidityFactor > 0 ? "Positive" : "Negative",
          soil: soilMultiplier > 1 ? "Excellent" : soilMultiplier > 0.95 ? "Good" : "Fair",
          weather: weatherMultiplier > 1 ? "Optimal" : weatherMultiplier > 0.9 ? "Good" : "Challenging",
        },
      };
      setResult(predictionResult);
      addPrediction(predictionResult);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="page">
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">🌾 Crop Yield Prediction</h1>
            <p className="card-description">Enter your agricultural parameters to get an AI-powered yield prediction with detailed analysis</p>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">🌡️ Temperature (°C)</label>
                <input type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} className="form-input" placeholder="e.g., 25.5" required />
              </div>
              <div className="form-group">
                <label className="form-label">🌧️ Rainfall (mm)</label>
                <input type="number" step="0.1" name="rainfall" value={formData.rainfall} onChange={handleChange} className="form-input" placeholder="e.g., 120.0" required />
              </div>
              <div className="form-group">
                <label className="form-label">💧 Humidity (%)</label>
                <input type="number" step="0.1" name="humidity" value={formData.humidity} onChange={handleChange} className="form-input" placeholder="e.g., 65.0" required />
              </div>
              <div className="form-group">
                <label className="form-label">🏔️ Soil Type</label>
                <select name="soilType" value={formData.soilType} onChange={handleChange} className="form-select">
                  <option value="Sandy">🏖️ Sandy Soil</option>
                  <option value="Loamy">🌱 Loamy Soil</option>
                  <option value="Peaty">🍂 Peaty Soil</option>
                  <option value="Clay">🧱 Clay Soil</option>
                  <option value="Silty">💧 Silty Soil</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">🌤️ Weather Condition</label>
                <select name="weather" value={formData.weather} onChange={handleChange} className="form-select">
                  <option value="Sunny">☀️ Sunny</option>
                  <option value="Rainy">🌧️ Rainy</option>
                  <option value="Stormy">⛈️ Stormy</option>
                  <option value="Cloudy">☁️ Cloudy</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">🌾 Crop Type</label>
                <select name="cropType" value={formData.cropType} onChange={handleChange} className="form-select">
                  <option value="Rice">🍚 Rice</option>
                  <option value="Corn">🌽 Corn</option>
                  <option value="Barley">🌾 Barley</option>
                  <option value="Soybeans">🫘 Soybeans</option>
                  <option value="Wheat">🌾 Wheat</option>
                </select>
              </div>
            </div>
            <button type="submit" className={`btn btn-primary ${loading ? 'btn-loading' : ''}`} disabled={loading} style={{ width: '100%', marginTop: 'var(--space-lg)' }}>
              {loading ? "Analyzing Environmental Data..." : "🔮 Predict Crop Yield"}
            </button>
          </form>

          {error && <div className="message message-error fade-in">❌ {error}</div>}
          {result && (
            <div className="result-card fade-in">
              <h2 style={{ color: 'var(--primary-green)', marginBottom: 'var(--space-md)' }}>📊 Prediction Result</h2>
              <div className="result-value">{result.yield}</div>
              <div className="result-label">tons per hectare</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Trend Forecast Page
function TrendForecast() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [trendData, setTrendData] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrendPrediction = async (e) => {
    e.preventDefault();
    if (!fromDate || !toDate) return setError("Please select both from and to dates");
    if (new Date(fromDate) >= new Date(toDate)) return setError("From date must be before to date");
    setLoading(true);
    setError("");
    setTrendData(null);
    setPredictions([]);
    try {
      const health = await fetch("http://127.0.0.1:8000/health");
      if (!health.ok) throw new Error("Cannot connect to backend server. Please make sure it's running on port 8000.");
      const resp = await fetch("http://127.0.0.1:8000/predict_trend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from_date: fromDate, to_date: toDate }),
      });
      if (!resp.ok) throw new Error(`Server error: ${resp.status}`);
      const data = await resp.json();
      if (!data || data.status !== 'success' || !Array.isArray(data.predictions)) throw new Error("No prediction data received from server");
      setTrendData(data);
      setPredictions(data.predictions);
    } catch (err) {
      setError(err.message || "Trend prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ backgroundColor: 'white', padding: '12px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <p style={{ fontWeight: 'bold', color: '#333', margin: '0 0 4px 0' }}>Date: {label}</p>
          <p style={{ color: '#4F46E5', margin: '0 0 4px 0' }}>Yield: {payload[0].value.toFixed(2)} tons/ha</p>
          {data.data_type && (
            <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: data.data_type === 'historical' ? '#2563EB' : '#7C3AED', margin: 0 }}>
              {data.data_type === 'historical' ? '📊 Historical' : '🔮 Predicted'}
            </p>
          )}
          {data.confidence_lower != null && (
            <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>Range: {data.confidence_lower.toFixed(2)} - {data.confidence_upper.toFixed(2)}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page">
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">📈 Yield Trend Analysis</h1>
            <p className="card-description">Analyze yield trends over custom date ranges using historical data and AI predictions</p>
          </div>
          <form className="form" onSubmit={handleTrendPrediction}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">📅 From Date</label>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">📅 To Date</label>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="form-input" required />
              </div>
            </div>
            <button type="submit" className={`btn btn-primary ${loading ? 'btn-loading' : ''}`} disabled={loading} style={{ width: '100%', marginTop: 'var(--space-lg)' }}>
              {loading ? "Analyzing Trend..." : "📊 Analyze Trend"}
            </button>
          </form>
          {error && <div className="message message-error fade-in">❌ {error}</div>}
        </div>

        {trendData && (
          <>
            <div className="stats-grid">
              <div className="stat-card" style={{ backgroundColor: 'white', border: '2px solid #10b981', boxShadow: '0 4px 6px rgba(16,185,129,0.1)' }}>
                <div className="stat-value" style={{ color: '#10b981' }}>{trendData.statistics.average_yield}</div>
                <div className="stat-label" style={{ color: '#374151' }}>Average Yield (tons/ha)</div>
              </div>
              <div className="stat-card" style={{ backgroundColor: 'white', border: '2px solid #10b981', boxShadow: '0 4px 6px rgba(16,185,129,0.1)' }}>
                <div className="stat-value" style={{ color: '#10b981' }}>{trendData.statistics.max_yield}</div>
                <div className="stat-label" style={{ color: '#374151' }}>Max Yield (tons/ha)</div>
              </div>
              <div className="stat-card" style={{ backgroundColor: 'white', border: '2px solid #10b981', boxShadow: '0 4px 6px rgba(16,185,129,0.1)' }}>
                <div className="stat-value" style={{ color: '#10b981' }}>{trendData.statistics.min_yield}</div>
                <div className="stat-label" style={{ color: '#374151' }}>Min Yield (tons/ha)</div>
              </div>
              <div className="stat-card" style={{ backgroundColor: 'white', border: '2px solid #10b981', boxShadow: '0 4px 6px rgba(16,185,129,0.1)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60px' }}>
                  {trendData.statistics.trend === 'increasing' ? '📈' : trendData.statistics.trend === 'decreasing' ? '📉' : '➡️'}
                </div>
                <div className="stat-label" style={{ color: '#374151', fontWeight: '600' }}>{trendData.statistics.trend.charAt(0).toUpperCase() + trendData.statistics.trend.slice(1)} Trend</div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">📊 Data Overview</h2>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669', minWidth: '40px' }}>{trendData.statistics.total_days}</div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>Total Days</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563EB', minWidth: '40px' }}>{trendData.statistics.historical_days}</div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>Historical Data</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7C3AED', minWidth: '40px' }}>{trendData.statistics.predicted_days}</div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>Predicted Data</div>
                </div>
              </div>
            </div>

            {predictions.length > 1 && (
              <div className="card" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', border: '1px solid #e2e8f0' }}>
                <div className="card-header">
                  <h2 className="card-title" style={{ color: '#2d3748' }}>📊 Yield Trend Over Time</h2>
                </div>
                <div style={{ height: '400px', width: '100%', borderRadius: '8px', padding: '10px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={predictions}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{ fill: '#6b7280' }} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <defs>
                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                          <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="predicted_yield" stroke="#6366f1" strokeWidth={3} fill="url(#trendGradient)" dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#ffffff" }} activeDot={{ r: 6, fill: "#4f46e5", strokeWidth: 2, stroke: "#ffffff" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Results Page
function Results() {
  const { predictions, clearPredictions } = useContext(PredictionContext);
  if (predictions.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}>🎯</div>
            <h1 className="card-title">Prediction Results History</h1>
            <p className="card-description" style={{ marginBottom: 'var(--space-lg)' }}>No prediction Insights available yet. Make some predictions to see your history and analysis here.</p>
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/predict" className="btn btn-primary">🔮 Make First Prediction</Link>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">📈 What You'll See Here</h2>
            </div>
            <div className="grid grid-3">
              <div style={{ textAlign: 'center', padding: 'var(--space-md)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>📊</div>
                <h3>Prediction History</h3>
                <p>Complete history of all your yield predictions with timestamps</p>
              </div>
              <div style={{ textAlign: 'center', padding: 'var(--space-md)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>🎯</div>
                <h3>Statistical Analysis</h3>
                <p>Average, maximum, and minimum yields from your prediction history</p>
              </div>
              <div style={{ textAlign: 'center', padding: 'var(--space-md)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>💡</div>
                <h3>Smart Insights</h3>
                <p>AI-powered recommendations based on your prediction patterns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const yields = predictions.map((p) => parseFloat(p.yield)).filter((y) => !isNaN(y));
  const avgYield = yields.length > 0 ? (yields.reduce((s, y) => s + y, 0) / yields.length).toFixed(2) : 0;
  const maxYield = yields.length > 0 ? Math.max(...yields).toFixed(2) : 0;

  const cropCounts = predictions.reduce((acc, p) => {
    const crop = p.formData.cropType;
    acc[crop] = (acc[crop] || 0) + 1;
    return acc;
  }, {});
  const mostPredictedCrop = Object.entries(cropCounts).sort(([, a], [, b]) => b - a)[0];

  // --- Smart Insights: actionable, personalized ---
  // 1. Outlier detection: what conditions correlate with low yield?
  const lowYieldThreshold = yields.length > 0 ? Math.max(1, Math.min(...yields) + 1) : 1.5;
  const lowYieldPreds = predictions.filter(p => parseFloat(p.yield) <= lowYieldThreshold);
  const lowYieldFactors = {};
  lowYieldPreds.forEach(p => {
    Object.entries(p.formData).forEach(([k, v]) => {
      if (!lowYieldFactors[k]) lowYieldFactors[k] = {};
      lowYieldFactors[k][v] = (lowYieldFactors[k][v] || 0) + 1;
    });
  });
  // Find most common factor in low yield
  const mostCommonLowYield = Object.entries(lowYieldFactors).map(([k, v]) => {
    const sorted = Object.entries(v).sort((a, b) => b[1] - a[1]);
    return sorted.length ? { key: k, value: sorted[0][0], count: sorted[0][1] } : null;
  }).filter(Boolean);

  // 2. Yield boosters: what factor correlates with high yield?
  const highYieldThreshold = yields.length > 0 ? Math.max(...yields) - 1 : 5;
  const highYieldPreds = predictions.filter(p => parseFloat(p.yield) >= highYieldThreshold);
  const highYieldFactors = {};
  highYieldPreds.forEach(p => {
    Object.entries(p.formData).forEach(([k, v]) => {
      if (!highYieldFactors[k]) highYieldFactors[k] = {};
      highYieldFactors[k][v] = (highYieldFactors[k][v] || 0) + 1;
    });
  });
  const mostCommonHighYield = Object.entries(highYieldFactors).map(([k, v]) => {
    const sorted = Object.entries(v).sort((a, b) => b[1] - a[1]);
    return sorted.length ? { key: k, value: sorted[0][0], count: sorted[0][1] } : null;
  }).filter(Boolean);

  // 3. Risk alerts: does high rainfall/humidity correlate with low yield?
  let riskAlert = null;
  if (predictions.length > 3) {
    const rainLow = predictions.filter(p => parseFloat(p.rainfall) > 200 && parseFloat(p.yield) < avgYield);
    const humLow = predictions.filter(p => parseFloat(p.humidity) > 80 && parseFloat(p.yield) < avgYield);
    if (rainLow.length > 1) riskAlert = 'High rainfall often correlates with lower yield.';
    else if (humLow.length > 1) riskAlert = 'High humidity often correlates with lower yield.';
  }

  // 4. Most stable conditions: which factor gives least yield variance?
  const varianceByKey = (key) => {
    const groups = {};
    predictions.forEach(p => {
      const k = p.formData?.[key];
      const y = parseFloat(p.yield);
      if (!k || isNaN(y)) return;
      if (!groups[k]) groups[k] = [];
      groups[k].push(y);
    });
    return Object.entries(groups).map(([k, arr]) => {
      const mean = arr.reduce((s, v) => s + v, 0) / arr.length;
      const variance = arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length;
      return { key: k, variance, count: arr.length };
    }).filter(x => x.count > 1);
  };
  const stableSoil = varianceByKey('soilType').sort((a, b) => a.variance - b.variance)[0];
  const stableWeather = varianceByKey('weather').sort((a, b) => a.variance - b.variance)[0];

  // 5. Personal best
  const bestPred = predictions.length ? predictions.reduce((a, b) => parseFloat(a.yield) > parseFloat(b.yield) ? a : b) : null;

  return (
    <div className="page">
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">🎯 Prediction Insights History</h1>
            <p className="card-description">Comprehensive analysis of your crop yield predictions with insights and trends</p>
            <div style={{ marginTop: 'var(--space-md)' }}>
              <button onClick={clearPredictions} className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>🗑️ Clear History</button>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-value">{predictions.length}</div><div className="stat-label">Total Predictions</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--secondary-green)' }}>{maxYield}</div><div className="stat-label">Highest Yield (tons/ha)</div></div>
          <div className="stat-card"><div className="stat-value">{avgYield}</div><div className="stat-label">Average Yield (tons/ha)</div></div>
          {mostPredictedCrop && (
            <div className="stat-card"><div className="stat-value">{mostPredictedCrop[0]}</div><div className="stat-label">Most Predicted Crop</div></div>
          )}
        </div>

        {/* Smart Insights - actionable */}
        <div className="card" style={{ textAlign: 'left' }}>
          <div className="card-header">
            <h2 className="card-title">🧠 Smart Insights</h2>
            <p className="card-description">Personalized, actionable tips based on your prediction history</p>
          </div>
          <ul style={{ margin: 0, padding: '0 var(--space-md) var(--space-md)', display: 'grid', gap: '8px' }}>
            {bestPred && (
              <li>� <strong>Personal Best:</strong> Your highest yield was <strong>{bestPred.yield} tons/ha</strong> on <strong>{bestPred.timestamp}</strong> with <strong>{bestPred.formData.soilType} soil</strong>, <strong>{bestPred.formData.weather} weather</strong>, and <strong>{bestPred.formData.cropType}</strong>.</li>
            )}
            {mostCommonLowYield.length > 0 && (
              <li>⚠️ <strong>Low Yield Alert:</strong> Low yields most often occurred with {mostCommonLowYield.map(f => <span key={f.key}> <strong>{f.value}</strong> {f.key}</span>)}. Try adjusting these factors.</li>
            )}
            {mostCommonHighYield.length > 0 && (
              <li>🚀 <strong>Yield Booster:</strong> High yields most often occurred with {mostCommonHighYield.map(f => <span key={f.key}> <strong>{f.value}</strong> {f.key}</span>)}. Consider repeating these conditions.</li>
            )}
            {riskAlert && (
              <li>🌧️ <strong>Risk Alert:</strong> {riskAlert}</li>
            )}
            {stableSoil && (
              <li>🧱 <strong>Most Stable Soil:</strong> <strong>{stableSoil.key}</strong> gave the most consistent yields (lowest variance).</li>
            )}
            {stableWeather && (
              <li>🌤️ <strong>Most Stable Weather:</strong> <strong>{stableWeather.key}</strong> gave the most consistent yields.</li>
            )}
          </ul>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📋 Prediction History</h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Showing {predictions.length} most recent predictions</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-md)' }}>
            {predictions.map((prediction, index) => (
              <div key={prediction.id || index} className="card" style={{ padding: 'var(--space-sm)' }}>
                <details>
                  <summary style={{ listStyle: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)', padding: 'var(--space-sm) var(--space-md)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600 }}>Prediction #{predictions.length - index}</span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{prediction.timestamp}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>
                        🎯 <span style={{ color: 'var(--secondary-green)' }}>{prediction.yield} tons/ha</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Confidence: {prediction.confidence} tons/ha</div>
                    </div>
                  </summary>
                  <div style={{ padding: '0 var(--space-md) var(--space-md)' }}>
                    <div className="grid grid-2" style={{ gap: 'var(--space-md)' }}>
                      <div>
                        <h4 style={{ marginBottom: 'var(--space-xs)', color: 'var(--text-primary)' }}>🌾 Conditions</h4>
                        <div style={{ fontSize: '0.9rem', display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 4 }}>
                          <div>🌡️ {prediction.formData.temperature}°C</div>
                          <div>🌧️ {prediction.formData.rainfall}mm</div>
                          <div>💧 {prediction.formData.humidity}%</div>
                          <div>🏔️ {prediction.formData.soilType} soil</div>
                          <div>🌤️ {prediction.formData.weather}</div>
                          <div>🌾 {prediction.formData.cropType}</div>
                        </div>
                      </div>
                      <div>
                        <h4 style={{ marginBottom: 'var(--space-xs)', color: 'var(--text-primary)' }}>🧠 Factor Assessment</h4>
                        <div style={{ fontSize: '0.9rem', background: 'var(--bg-accent)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)' }}>
                          Soil: {prediction.factors.soil}, Weather: {prediction.factors.weather}
                        </div>
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-brand">🌾 AgriYield Predictor</div>
        <div className="footer-text">Empowering farmers and agricultural professionals with AI-driven crop yield predictions</div>
      </div>
    </footer>
  );
}

// Main App
function App() {
  return (
    <PredictionProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <NavBar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/predict" element={<PredictForm />} />
              <Route path="/trend" element={<TrendForecast />} />
              <Route path="/results" element={<Results />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </PredictionProvider>
  );
}

export default App;
// End of file