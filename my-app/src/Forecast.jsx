import { useState } from "react";
import "./App.css"; // make sure this contains the .forecast-card styles

function Forecast7Days() {
  const [startDate, setStartDate] = useState("");
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");

  const fetchForecast = async () => {
    if (!startDate) {
      setError("Please select a start date");
      setForecast([]);
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/forecast/7days?start_date=${startDate}`
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to fetch forecast");
      }

      const data = await response.json();
      setForecast(data.forecast);
      setError("");
    } catch (err) {
      setError(err.message);
      setForecast([]);
    }
  };

  return (
    <div className="forecast-card">
      <h2>7-Day Crop Yield Forecast</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Start Date:{" "}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <button onClick={fetchForecast} style={{ marginLeft: "1rem" }}>
          Get Forecast
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {forecast.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                Date
              </th>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                Predicted Yield
              </th>
            </tr>
          </thead>
          <tbody>
            {forecast.map((item, idx) => (
              <tr
                key={idx}
                style={{
                  backgroundColor: idx % 2 === 0 ? "#fff" : "#fafafa",
                }}
              >
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  {item.Date}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  {item.Predicted_Crop_Yield.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Forecast7Days;
