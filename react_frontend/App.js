import React, { useEffect, useState } from "react";
import CropForm from "./CropForm";
import "./App.css";

function App() {
  const [backendStatus, setBackendStatus] = useState("Checking backend...");

  useEffect(() => {
    fetch("http://localhost:5000/")  // Ensure this matches your backend
      .then((res) => {
        if (res.ok) return res.text();
        throw new Error("Backend not reachable");
      })
      .then((text) => setBackendStatus(text))
      .catch(() => setBackendStatus("❌ Backend not reachable. Start the server."));
  }, []);

  return (
    <div className="app-container">
      <h1>🌾 Crop Yield Prediction</h1>
      <p style={{ color: backendStatus.includes("❌") ? "red" : "green" }}>
        {backendStatus}
      </p>
      <CropForm />
    </div>
  );
}

export default App;
