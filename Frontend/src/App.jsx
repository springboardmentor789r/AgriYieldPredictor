import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PredictForm from "./components/PredictForm";
import ForecastForm from "./components/ForecastForm";
import "./App.css";


function App() {
  return (
    <Router>
      <div className="app-container">
        <h1>🌱 Crop Yield Prediction</h1>

        <nav>
          <Link to="/predict">
            <button>Go to Predict</button>
          </Link>
          <Link to="/forecast">
            <button>Go to Forecast</button>
          </Link>
        </nav>

        <hr />

        <Routes>
          <Route path="/predict" element={<PredictForm />} />
          <Route path="/forecast" element={<ForecastForm />} />
          <Route path="/" element={<PredictForm />} /> {/* default page */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
