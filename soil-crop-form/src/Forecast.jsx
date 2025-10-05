import { useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./App.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Forecast() {
  const [forecastDate, setForecastDate] = useState("");
  const [forecastResult, setForecastResult] = useState([]);
  const [averageForecast, setAverageForecast] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Max date for 2 months ahead
  const maxDateObj = new Date();
  maxDateObj.setMonth(maxDateObj.getMonth() + 2);
  const maxDD = String(maxDateObj.getDate()).padStart(2, "0");
  const maxMM = String(maxDateObj.getMonth() + 1).padStart(2, "0");
  const maxYYYY = maxDateObj.getFullYear();
  const maxDate = `${maxYYYY}-${maxMM}-${maxDD}`;

  const handleForecast = async () => {
    if (!forecastDate) {
      setErrorMsg("Please select a start date.");
      return;
    }

    setErrorMsg("");
    setForecastResult([]);
    setAverageForecast(null);

    try {
      const response = await axios.get(`http://localhost:8000/forecast?steps=7`);
      const forecast = response.data.forecast;

      setForecastResult(forecast);

      const avg = forecast.reduce((acc, val) => acc + val, 0) / forecast.length;
      setAverageForecast(avg);
    } catch (error) {
      setErrorMsg(error.response?.data?.detail || error.message);
    }
  };

  const formatDate = (dateObj) => dateObj.toISOString().split("T")[0];

  // Colors for each row
  const rowColors = [
    "#FFCDD2",
    "#F8BBD0",
    "#E1BEE7",
    "#D1C4E9",
    "#C5CAE9",
    "#BBDEFB",
    "#B3E5FC",
    "#B2EBF2",
    "#B2DFDB",
    "#C8E6C9",
    "#DCEDC8",
    "#F0F4C3",
    "#FFF9C4",
    "#FFECB3",
    "#FFE0B2",
  ];

  const chartData = {
    labels: forecastResult.map((_, idx) => {
      const start = new Date(forecastDate);
      start.setDate(start.getDate() + idx);
      return formatDate(start);
    }),
    datasets: [
      {
        label: "Yield Forecast Timeline",
        data: forecastResult,
        borderColor: "rgba(54,162,235,1)",
        backgroundColor: "rgba(0,0,0,0)",
        tension: 0.2,
        pointRadius: 5,        // show points
        pointHoverRadius: 7,   // bigger on hover
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="container">
      <div className="form-box2">
        <h1>🌾 Crop Yield Forecast Dashboard</h1>

        {/* Date Selector */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <input
            type="date"
            value={forecastDate}
            max={maxDate}
            onChange={(e) => setForecastDate(e.target.value)}
          />
          <button onClick={handleForecast} style={{ padding: "8px 16px" }}>
            Get Forecast
          </button>
        </div>

        {forecastResult.length > 0 && (
          <>
            {/* Top Info Cards */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
                marginBottom: "20px",
                flexWrap: "wrap",
              }}
            >
              <div
                className="card"
                style={{
                  flex: "1",
                  textAlign: "center",
                  background: "#eaf2ff",
                  padding: "15px",
                  borderRadius: "8px",
                }}
              >
                <h2>{averageForecast.toFixed(2)}</h2>
                <p>Average Yield</p>
              </div>
              <div
                className="card"
                style={{
                  flex: "1",
                  textAlign: "center",
                  background: "#fbeaff",
                  padding: "15px",
                  borderRadius: "8px",
                }}
              >
                <h2>{forecastResult.length}</h2>
                <p>Days Predicted</p>
              </div>
            </div>

            {/* Day-wise Forecast Table + Chart Side by Side */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "40px",
              }}
            >
              {/* Forecast Table */}
              <div
                className="result"
                style={{
                  flex: "2 1 600px",
                  background: "#fff",
                  padding: "15px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  overflowX: "auto",
                }}
              >
                <h3 style={{ marginBottom: "15px", fontWeight: "600" }}>
                  Day-wise Forecast:
                </h3>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#4caf50", color: "#fff" }}>
                      <th style={{ padding: "8px", border: "1px solid #ddd" }}>Date</th>
                      <th style={{ padding: "8px", border: "1px solid #ddd" }}>Predicted Yield</th>
                      <th style={{ padding: "8px", border: "1px solid #ddd" }}>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecastResult.map((val, idx) => {
                      const start = new Date(forecastDate);
                      start.setDate(start.getDate() + idx);

                      let trend = "";
                      let trendColor = "#444";
                      if (idx === 0) {
                        trend = "🟢 Base Day";
                      } else if (val > forecastResult[idx - 1]) {
                        trend = "📈 Increasing";
                        trendColor = "green";
                      } else if (val < forecastResult[idx - 1]) {
                        trend = "📉 Decreasing";
                        trendColor = "red";
                      } else {
                        trend = "➖ No Change";
                      }

                      return (
                        <tr
                          key={idx}
                          style={{
                            background: rowColors[idx % rowColors.length], // unique row color
                          }}
                        >
                          <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                            {formatDate(start)}
                          </td>
                          <td
                            style={{
                              padding: "8px",
                              border: "1px solid #ddd",
                              fontWeight: "600",
                              color: "#000",
                            }}
                          >
                            {val.toFixed(2)}
                          </td>
                          <td
                            style={{
                              padding: "8px",
                              border: "1px solid #ddd",
                              color: trendColor,
                              fontWeight: "500",
                            }}
                          >
                            {trend}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Chart */}
              <div
                style={{
                  flex: "1 1 400px",
                  minWidth: "350px",
                  height: "400px",
                  background: "#fff",
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top" },
                      title: {
                        display: true,
                        text: "Yield Forecast Timeline",
                      },
                    },
                    scales: {
                      x: {
                        ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 },
                      },
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </>
        )}

        {errorMsg && (
          <div className="error">
            <h3>Error</h3>
            <p>{errorMsg}</p>
          </div>
        )}
      </div>
    </div>
  );
}
