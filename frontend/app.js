const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const API_URL = "http://127.0.0.1:8000";

// ---------------- Home Route ---------------- 
app.get("/", async (req, res) => {
  try {
    const crops = (await axios.get(`${API_URL}/crop_types`)).data.crop_types;
    const soils = (await axios.get(`${API_URL}/soil_types`)).data.soil_types;
    const weathers = (await axios.get(`${API_URL}/weather_conditions`)).data.weather_conditions;

    const cropOptions = crops.map(c => `<option value="${c}">${c}</option>`).join("");
    const soilOptions = soils.map(s => `<option value="${s}">${s}</option>`).join("");
    const weatherOptions = weathers.map(w => `<option value="${w}">${w}</option>`).join("");

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>🌱 Agri Yield App</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
        <style>
          body { font-family: 'Segoe UI', sans-serif; margin:0; background:#e6f2ea; }
          .container { max-width: 420px; margin: 20px auto; }
          h1 { text-align:center; color:#2d6a4f; margin-bottom:10px; }
          nav { display:flex; justify-content:space-between; margin-bottom:15px; }
          nav button { flex:1; margin:0 5px; padding:10px; border:none; border-radius:10px; cursor:pointer; font-weight:600; color:#fff; background:#95d5b2; transition:0.2s; }
          nav button.active { background:#2d6a4f; }
          .tab { display:none; }
          .card { background:#fff; padding:20px; border-radius:15px; box-shadow:0 10px 20px rgba(0,0,0,0.1); margin-bottom:20px; }
          label { display:block; margin-top:10px; margin-bottom:5px; font-weight:600; }
          input, select { width:100%; padding:10px; border-radius:8px; border:1px solid #ccc; font-size:1rem; }
          button.submit-btn { background:#2d6a4f; color:#fff; width:100%; padding:12px; border:none; border-radius:8px; margin-top:15px; cursor:pointer; font-weight:600; }
          button.submit-btn:hover { background:#1b4332; }
          table { width:100%; border-collapse:collapse; margin-top:15px; }
          th, td { padding:8px; text-align:center; border:1px solid #ccc; }
          th { background:#2d6a4f; color:#fff; }
          canvas { margin-top:15px; border-radius:10px; background:#fff; padding:10px; }
          ul { padding-left:20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🌱 Agri Yield App</h1>
          <nav>
            <button id="tab1Btn" class="active">Single Yield</button>
            <button id="tab2Btn">7-Day Forecast</button>
            <button id="tab3Btn">Features</button>
          </nav>

          <!-- Single Yield -->
          <div id="tab1" class="tab" style="display:block;">
            <div class="card">
              <form id="yieldForm">
                <label>Crop Type:</label>
                <select name="Crop_Type">${cropOptions}</select>

                <label>Soil Type:</label>
                <select name="Soil_Type">${soilOptions}</select>

                <label>Weather Condition:</label>
                <select name="Weather_Condition">${weatherOptions}</select>

                <label>Temperature (°C):</label>
                <input type="number" name="Temperature" step="0.01" required />

                <label>Rainfall (mm):</label>
                <input type="number" name="Rainfall" step="0.01" required />

                <label>Humidity (%):</label>
                <input type="number" name="Humidity" step="0.01" required />

                <button class="submit-btn" type="submit">🌾 Predict Yield</button>
              </form>
              <p id="yieldResult" style="margin-top:15px; font-weight:600; font-size:1.1rem;"></p>
            </div>
          </div>

          <!-- Forecast -->
          <div id="tab2" class="tab">
            <div class="card">
              <form id="forecastForm">
                <label>Start Date (optional):</label>
                <input type="date" name="start_date" />
                <button class="submit-btn" type="submit">📅 Get 7-Day Forecast</button>
              </form>

              <table id="forecastTable" style="display:none;">
                <thead>
                  <tr><th>Date</th><th>Yield (tons/hectare)</th></tr>
                </thead>
                <tbody></tbody>
              </table>

              <canvas id="forecastChart"></canvas>
            </div>
          </div>

          <!-- Features -->
          <div id="tab3" class="tab">
            <div class="card">
              <h3>App Features:</h3>
              <ul>
                <li>Predict crop yield based on soil, weather, and fertilizer.</li>
                <li>View 7-day crop yield forecast.</li>
                <li>Interactive forecast chart using Chart.js.</li>
                <li>Dynamic color coding for yield (red=low, yellow=medium, green=high).</li>
                <li>Responsive and mobile-friendly interface.</li>
                <li>Gradient line chart with tooltips for each point.</li>
                <li>Min/Max/Avg lines for forecast insights.</li>
              </ul>
            </div>
          </div>
        </div>

        <script>
          // ---------------- Tabs ----------------
          const tab1Btn = document.getElementById("tab1Btn");
          const tab2Btn = document.getElementById("tab2Btn");
          const tab3Btn = document.getElementById("tab3Btn");
          const tab1 = document.getElementById("tab1");
          const tab2 = document.getElementById("tab2");
          const tab3 = document.getElementById("tab3");

          function showTab(btn, tab) {
            [tab1, tab2, tab3].forEach(t => t.style.display = "none");
            [tab1Btn, tab2Btn, tab3Btn].forEach(b => b.classList.remove("active"));
            tab.style.display = "block";
            btn.classList.add("active");
          }

          tab1Btn.onclick = () => showTab(tab1Btn, tab1);
          tab2Btn.onclick = () => showTab(tab2Btn, tab2);
          tab3Btn.onclick = () => showTab(tab3Btn, tab3);

          // ---------------- Single Yield ----------------
          document.getElementById("yieldForm").onsubmit = async (e) => {
            e.preventDefault();
            const form = e.target;
            const data = {
              Crop_Type: form.Crop_Type.value,
              Soil_Type: form.Soil_Type.value,
              Weather_Condition: form.Weather_Condition.value,
              Temperature: parseFloat(form.Temperature.value),
              Raifall: parseFloat(form.Rainfall.value),
              Humidity: parseFloat(form.Humidity.value)
            };
            try {
              const res = await axios.post("${API_URL}/predict_yield", data);
              const yieldVal = res.data.predicted_yield;
              let color = "black";
              if (yieldVal >= 5) color = "green";
              else if (yieldVal >= 2) color = "orange";
              else color = "red";

              const resultElem = document.getElementById("yieldResult");
              resultElem.innerText = "Predicted Yield: " + yieldVal.toFixed(2) + " tons/hectare";
              resultElem.style.color = color;
            } catch(err) {
              alert("Error predicting yield: " + err.message);
            }
          };

          // ---------------- Forecast ----------------
          document.getElementById("forecastForm").onsubmit = async (e) => {
            e.preventDefault();
            const start_date = e.target.start_date.value;
            try {
              const res = await axios.post("${API_URL}/forecast_yield", { date: start_date });
              const forecast = res.data;

              // --- Table with dynamic colors ---
              const table = document.getElementById("forecastTable");
              const tbody = table.querySelector("tbody");
              tbody.innerHTML = "";
              forecast.forEach(f => {
                const row = document.createElement("tr");
                let color = "black";
                if (f.Yield >= 5) color = "green";
                else if (f.Yield >= 2) color = "orange";
                else color = "red";
                row.innerHTML = "<td>" + f.Date + "</td><td style='color:" + color + "; font-weight:600;'>" + f.Yield.toFixed(2) + "</td>";
                tbody.appendChild(row);
              });
              table.style.display = "table";

              // --- Chart with gradient line, colored points & min/max/avg lines ---
              const labels = forecast.map(f => f.Date);
              const data = forecast.map(f => f.Yield);
              const ctx = document.getElementById("forecastChart").getContext('2d');
              if(window.forecastChart instanceof Chart) window.forecastChart.destroy();

              const gradient = ctx.createLinearGradient(0,0,0,400);
              gradient.addColorStop(0, 'green');
              gradient.addColorStop(0.5, 'orange');
              gradient.addColorStop(1, 'red');

              const minVal = Math.min(...data);
              const maxVal = Math.max(...data);
              const avgVal = data.reduce((a,b)=>a+b,0)/data.length;

              window.forecastChart = new Chart(ctx, {
                type: 'line',
                data: {
                  labels: labels,
                  datasets: [
                    {
                      label: 'Crop Yield (tons/hectare)',
                      data: data,
                      borderColor: gradient,
                      backgroundColor: 'rgba(45,106,79,0.2)',
                      fill: true,
                      tension: 0.3,
                      pointBackgroundColor: data.map(val => val >= 5 ? 'green' : val >= 2 ? 'orange' : 'red'),
                      pointRadius: 6
                    },
                    { label:'Min Yield', data:Array(data.length).fill(minVal), borderColor:'red', borderDash:[5,5], fill:false, pointRadius:0 },
                    { label:'Max Yield', data:Array(data.length).fill(maxVal), borderColor:'green', borderDash:[5,5], fill:false, pointRadius:0 },
                    { label:'Avg Yield', data:Array(data.length).fill(avgVal), borderColor:'orange', borderDash:[5,5], fill:false, pointRadius:0 }
                  ]
                },
                options: {
                  responsive: true,
                  plugins: {
                    tooltip: {
                      enabled: true,
                      callbacks: {
                        label: function(context) {
                          return context.dataset.label + ': ' + context.raw.toFixed(2) + ' tons/hectare';
                        }
                      }
                    },
                    legend: {
                      display: true,
                      labels: { usePointStyle: true }
                    }
                  },
                  scales: { y: { beginAtZero: true } }
                }
              });

            } catch(err) {
              alert("Error fetching forecast: " + err.message);
            }
          };
        </script>
      </body>
      </html>
    `);
  } catch(err) {
    res.status(500).send("Error loading form: " + err.message);
  }
});

app.listen(3000, () => console.log("✅ Express server running on http://localhost:3000"));
