import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Home from "./Home";
import Forecast from "./Forecast";

function Navbar() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        padding: "10px",
        background: "#eee",
      }}
    >
      <div style={{ marginLeft: "auto", display: "flex", gap: "20px" }}>
        <button onClick={() => navigate("/")} style={{ padding: "8px 16px" }}>
          Home
        </button>
        <button onClick={() => navigate("/forecast")} style={{ padding: "8px 16px" }}>
          Forecast
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/forecast" element={<Forecast />} />
      </Routes>
    </Router>
  );
}
