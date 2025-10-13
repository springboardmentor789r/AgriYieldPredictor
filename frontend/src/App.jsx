import React, { useState, useContext, createContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
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

  const clearPredictions = () => {
    setPredictions([]);
  };

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
        <Link to="/" className="navbar-brand">
          🌾 AgriYield Predictor
        </Link>
        <ul className="navbar-nav">
          <li>
            <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>🏠 Home</Link>
          </li>
          <li>
            <Link to="/predict" className={`nav-link ${isActive("/predict") ? "active" : ""}`}>🔮 Predict</Link>
          </li>
          <li>
            <Link to="/trend" className={`nav-link ${isActive("/trend") ? "active" : ""}`}>📈 Trend</Link>
          </li>
          <li>
            <Link to="/results" className={`nav-link ${isActive("/results") ? "active" : ""}`}>🎯 Insights</Link>
          </li>
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
          <p className="hero-subtitle">
            Revolutionizing agriculture with AI-powered crop yield predictions using environmental and soil data
          </p>
          <div style={{ display: "flex", gap: "var(--space-md)", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/predict" className="btn btn-primary">🔮 Start Predicting</Link>
            <Link to="/trend" className="btn btn-secondary">📈 Forecast Trend</Link>
            <Link to="/results" className="btn btn-secondary">🎯 View Insights</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Predict Form
function PredictForm() {
  const { addPrediction } = useContext(PredictionContext);
  const [formData, setFormData] = useState({
    temperature: "",
    rainfall: "",
    humidity: "",
    soilType: "Sandy",
    weather: "Sunny",
    cropType: "Rice",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    setTimeout(() => {
      const baseYield = 3.2;
      const tempFactor = (parseFloat(formData.temperature) - 25) * 0.05;
      const rainFactor = (parseFloat(formData.rainfall) - 100) * 0.01;
      const humidityFactor = (parseFloat(formData.humidity) - 60) * 0.02;

      const soilMultipliers = { Sandy: 0.9, Loamy: 1.2, Peaty: 1.1, Clay: 0.95, Silty: 1.05 };
      const weatherMultipliers = { Sunny: 1.1, Rainy: 0.95, Stormy: 0.8, Cloudy: 1.0 };

      const soilMultiplier = soilMultipliers[formData.soilType] || 1;
      const weatherMultiplier = weatherMultipliers[formData.weather] || 1;

      const predictedYield = Math.max(
        0.5,
        (baseYield + tempFactor + rainFactor + humidityFactor) * soilMultiplier * weatherMultiplier + (Math.random() - 0.5) * 0.3
      );

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
    }, 2000);
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
              {/* Temperature */}
              <div className="form-group">
                <label className="form-label">🌡️ Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., 25.5"
                  required
                />
              </div>

              {/* Rainfall */}
              <div className="form-group">
                <label className="form-label">🌧️ Rainfall (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  name="rainfall"
                  value={formData.rainfall}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., 120"
                  required
                />
              </div>

              {/* Humidity */}
              <div className="form-group">
                <label className="form-label">💧 Humidity (%)</label>
                <input
                  type="number"
                  step="0.1"
                  name="humidity"
                  value={formData.humidity}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., 65"
                  required
                />
              </div>

              {/* Soil Type */}
              <div className="form-group">
                <label className="form-label">🏔️ Soil Type</label>
                <select name="soilType" value={formData.soilType} onChange={handleChange} className="form-select">
                  <option value="Sandy">🏖️ Sandy</option>
                  <option value="Loamy">🌱 Loamy</option>
                  <option value="Peaty">🍂 Peaty</option>
                  <option value="Clay">🧱 Clay</option>
                  <option value="Silty">💧 Silty</option>
                </select>
              </div>

              {/* Weather */}
              <div className="form-group">
                <label className="form-label">🌤️ Weather</label>
                <select name="weather" value={formData.weather} onChange={handleChange} className="form-select">
                  <option value="Sunny">☀️ Sunny</option>
                  <option value="Rainy">🌧️ Rainy</option>
                  <option value="Stormy">⛈️ Stormy</option>
                  <option value="Cloudy">☁️ Cloudy</option>
                </select>
              </div>

              {/* Crop Type */}
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

            <button
              type="submit"
              className={`btn btn-primary ${loading ? "btn-loading" : ""}`}
              disabled={loading}
              style={{ width: "100%", marginTop: "var(--space-lg)" }}
            >
              {loading ? "Analyzing Environmental Data..." : "🔮 Predict Crop Yield"}
            </button>
          </form>

          {result && (
            <div className="result-card fade-in">
              <h2 style={{ color: "var(--primary-green)", marginBottom: "var(--space-md)" }}>📊 Prediction Result</h2>
              <div className="result-value">{result.yield}</div>
              <div className="result-label">tons per hectare</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Trend Forecast
function Trend() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setRows([]);
    if (!fromDate || !toDate) {
      setError("Please select both From and To dates.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      const dummyRows = [];
      let current = new Date(start);
      while (current <= end) {
        dummyRows.push({
          date: current.toISOString().split("T")[0],
          yield_prediction: (Math.random() * 3 + 2).toFixed(2),
        });
        current.setDate(current.getDate() + 1);
      }
      setRows(dummyRows);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="page">
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">📈 Time Series Trend Forecast</h1>
            <p className="card-description">Choose any date range to forecast daily crop yield</p>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">From Date</label>
                <input type="date" className="form-input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">To Date</label>
                <input type="date" className="form-input" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className={`btn btn-primary ${loading ? "btn-loading" : ""}`} disabled={loading}>
              {loading ? "Generating Forecast..." : "📈 Generate Trend Forecast"}
            </button>
          </form>

          {error && <div className="message message-error">{error}</div>}

          {rows.length > 0 && (
            <div className="table-wrapper">
              <h2 style={{ color: "var(--primary-green)" }}>Forecast Table</h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Yield Prediction</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.date}>
                      <td>{r.date}</td>
                      <td>{r.yield_prediction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Results/Insights Page with Crop Recommendation
function Results() {
  const { predictions, clearPredictions } = useContext(PredictionContext);

  if (predictions.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}>🎯</div>
            <h1 className="card-title">Prediction Results History</h1>
            <p className="card-description" style={{ marginBottom: 'var(--space-lg)' }}>
              No prediction Insights available yet. Make some predictions to see your history and analysis here.
            </p>
            <Link to="/predict" className="btn btn-primary">🔮 Make First Prediction</Link>
          </div>
        </div>
      </div>
    );
  }

  // Yield stats
  const yields = predictions.map(p => parseFloat(p.yield)).filter(y => !isNaN(y));
  const avgYield = yields.length > 0 ? (yields.reduce((sum, y) => sum + y, 0) / yields.length).toFixed(2) : 0;
  const maxYield = yields.length > 0 ? Math.max(...yields).toFixed(2) : 0;
  const minYield = yields.length > 0 ? Math.min(...yields).toFixed(2) : 0;

  // Most predicted crop
  const cropCounts = predictions.reduce((acc, p) => {
    const crop = p.formData.cropType;
    acc[crop] = (acc[crop] || 0) + 1;
    return acc;
  }, {});
  const mostPredictedCrop = Object.entries(cropCounts).sort(([,a], [,b]) => b - a)[0];

  // Crop recommendation logic
  const latestPrediction = predictions[0].formData;
  const cropRecommendation = (() => {
    const { temperature, rainfall, soilType } = latestPrediction;
    if (temperature >= 20 && temperature <= 30 && rainfall >= 100 && rainfall <= 200 && soilType === "Loamy") return "🌱 Rice";
    if (temperature >= 25 && rainfall <= 120 && soilType === "Sandy") return "🌽 Corn";
    if (temperature >= 18 && temperature <= 25 && rainfall <= 100 && soilType === "Clay") return "🌾 Wheat";
    if (temperature >= 22 && rainfall >= 150 && soilType === "Peaty") return "🫘 Soybeans";
    return "Various suitable crops based on soil and weather";
  })();

  return (
    <div className="page">
      <div className="container">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{predictions.length}</div>
            <div className="stat-label">Total Predictions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--secondary-green)' }}>{maxYield}</div>
            <div className="stat-label">Highest Yield (tons/ha)</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{minYield}</div>
            <div className="stat-label">Lowest Yield (tons/ha)</div>
          </div>
        </div>

        {/* Prediction History */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📋 Prediction History</h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Showing {predictions.length} most recent predictions
            </p>
            <div style={{ marginTop: 'var(--space-md)' }}>
              <button onClick={clearPredictions} className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
                🗑️ Clear History
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {predictions.map((prediction, index) => (
              <div key={prediction.id} className="data-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <h3 style={{ margin: 0, color: 'var(--primary-green)' }}>
                    Prediction #{predictions.length - index}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {prediction.timestamp}
                  </span>
                </div>

                <div className="grid grid-2" style={{ gap: 'var(--space-md)' }}>
                  <div>
                    <h4 style={{ marginBottom: 'var(--space-sm)', color: 'var(--text-primary)' }}>
                      🎯 Result: <span style={{ color: 'var(--secondary-green)' }}>{prediction.yield} tons/ha</span>
                    </h4>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      Confidence: {prediction.confidence} tons/ha
                    </div>
                  </div>

                  <div>
                    <h4 style={{ marginBottom: 'var(--space-sm)', color: 'var(--text-primary)' }}>
                      🌾 Conditions
                    </h4>
                    <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div>🌡️ {prediction.formData.temperature}°C</div>
                      <div>🌧️ {prediction.formData.rainfall}mm</div>
                      <div>💧 {prediction.formData.humidity}%</div>
                      <div>🏔️ {prediction.formData.soilType} soil</div>
                      <div>🌤️ {prediction.formData.weather} weather</div>
                      <div>🌾 {prediction.formData.cropType}</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 'var(--space-sm)', padding: 'var(--space-sm)', background: 'var(--bg-accent)', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Factor Assessment:</strong>
                  <span style={{ marginLeft: 'var(--space-xs)' }}>
                    Soil: {prediction.factors.soil}, Weather: {prediction.factors.weather}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">💡 Insights & Recommendations</h2>
          </div>
          <div className="grid grid-2">
            <div style={{ padding: 'var(--space-lg)', background: 'var(--gradient-secondary)', borderRadius: 'var(--radius-md)', border: '2px solid var(--accent-green)' }}>
              <h3 style={{ color: 'var(--primary-green)', marginBottom: 'var(--space-sm)' }}>🌟 Best Performance</h3>
              <p>
                Your highest yield was <strong>{maxYield} tons/ha</strong>. 
                {predictions.length > 1 && ` This is ${((maxYield - avgYield) / avgYield * 100).toFixed(1)}% above your average.`}
              </p>
            </div>

            <div style={{ padding: 'var(--space-lg)', background: 'var(--gradient-secondary)', borderRadius: 'var(--radius-md)', border: '2px solid var(--accent-green)' }}>
              <h3 style={{ color: 'var(--primary-green)', marginBottom: 'var(--space-sm)' }}>📈 Prediction Trends</h3>
              <p>
                You've made {predictions.length} predictions with {mostPredictedCrop ? mostPredictedCrop[0] : 'various crops'} being your most analyzed crop.
                {yields.length > 2 && ` Your yield range spans ${(maxYield - minYield).toFixed(2)} tons/ha.`}
              </p>
            </div>
          </div>

          <div className="card" style={{ marginTop: 'var(--space-md)' }}>
            <div className="card-header">
              <h3 className="card-title">🌾 Recommended Crop Based on Latest Prediction</h3>
            </div>
            <div style={{ padding: 'var(--space-md)', fontSize: '1.1rem', color: 'var(--secondary-green)' }}>
              {cropRecommendation}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// App
export default function App() {
  return (
    <PredictionProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/predict" element={<PredictForm />} />
          <Route path="/trend" element={<Trend />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </Router>
    </PredictionProvider>
  );
}
