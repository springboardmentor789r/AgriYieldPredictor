import { useState } from "react";

export default function ForecastForm() {
  const [date, setDate] = useState("");       // selected date
  const [forecast, setForecast] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setForecast(null);
    setErrorMsg(null);

    try {
      // Convert YYYY-MM-DD (from input) -> DD-MM-YYYY (for backend)
      const parts = date.split("-");
      const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

      const response = await fetch("http://localhost:8000/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Date: formattedDate }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();

      if (data.status === "success") {
        setForecast(data.forecast);   // store forecast list
      } else {
        setErrorMsg(data.message || "Forecast failed");
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="form-container">
      <h2>🌾 Crop Yield 10-Day Forecast</h2>
      <form onSubmit={handleSubmit}>
        <label>Select Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <button type="submit">Get Forecast</button>
      </form>

      {forecast && (
        <div className="forecast-results">
          <h3>📊 Forecast Results</h3>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Date</th>
                <th>Forecasted Yield</th>
              </tr>
            </thead>
            <tbody>
              {forecast.map((item, index) => (
                <tr key={index}>
                  <td>{item.Date}</td> {/* already DD-MM-YYYY from backend */}
                  <td>{item.Forecasted_Yield.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {errorMsg && <div style={{ color: "red" }}>{errorMsg}</div>}
    </div>
  );
}
