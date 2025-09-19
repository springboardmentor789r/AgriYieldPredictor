const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// FastAPI backend URL
const API_URL = "http://127.0.0.1:8000";

// Show form
app.get("/", async (req, res) => {
  try {
    const [crops, soils, weather] = await Promise.all([
      axios.get(`${API_URL}/crop_types`),
      axios.get(`${API_URL}/soil_types`),
      axios.get(`${API_URL}/weather_conditions`)
    ]);

    res.send(`
      <html>
      <head>
        <title>Agri Yield Predictor</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            background: linear-gradient(135deg, #52b788, #74c69d, #95d5b2);
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .container {
            background: rgba(255, 255, 255, 0.8);
            padding: 35px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0px 8px 24px rgba(0,0,0,0.2);
            width: 420px;
            animation: slideIn 0.9s ease-in-out;
          }
          h1 {
            text-align: center;
            color: #1b4332;
            margin-bottom: 25px;
          }
          label {
            font-weight: 600;
            margin-top: 12px;
            display: block;
            color: #2d6a4f;
          }
          input, select {
            width: 100%;
            padding: 12px;
            margin-top: 6px;
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 10px;
            transition: 0.3s;
          }
          input:focus, select:focus {
            border-color: #40916c;
            outline: none;
            transform: scale(1.02);
            box-shadow: 0px 0px 8px rgba(64,145,108,0.6);
          }
          button {
            width: 100%;
            padding: 14px;
            background: linear-gradient(90deg, #2d6a4f, #1b4332);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 17px;
            cursor: pointer;
            transition: 0.4s;
          }
          button:hover {
            background: linear-gradient(90deg, #40916c, #2d6a4f);
            transform: scale(1.05);
          }
          .footer {
            margin-top: 18px;
            text-align: center;
            font-size: 13px;
            color: #444;
          }
          @keyframes slideIn {
            from {opacity: 0; transform: translateY(-20px);}
            to {opacity: 1; transform: translateY(0);}
          }
          /* Loader overlay */
          #loader {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255,255,255,0.6);
            backdrop-filter: blur(4px);
            z-index: 1000;
            justify-content: center;
            align-items: center;
          }
          .spinner {
            border: 6px solid #f3f3f3;
            border-top: 6px solid #2d6a4f;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        </style>
        <script>
          function showLoader() {
            document.getElementById("loader").style.display = "flex";
          }
        </script>
      </head>
      <body>
        <div class="container">
          <h1>🌾 Agri Yield Predictor</h1>
          <form action="/predict" method="post" onsubmit="showLoader()">
            <label>🌱 Crop Type:</label>
            <select name="Crop_Type" required>
              ${crops.data.crop_types.map(c => `<option value="${c}">${c}</option>`).join("")}
            </select>

            <label>🪨 Soil Type:</label>
            <select name="Soil_Type" required>
              ${soils.data.soil_types.map(s => `<option value="${s}">${s}</option>`).join("")}
            </select>

            <label>🌦 Weather Condition:</label>
            <select name="Weather_Condition" required>
              ${weather.data.weather_conditions.map(w => `<option value="${w}">${w}</option>`).join("")}
            </select>

            <label>🌡 Temperature (°C):</label>
            <input type="number" step="0.1" name="Temperature" required>

            <label>💧 Rainfall (mm):</label>
            <input type="number" step="0.1" name="Raifall" required>

            <label>💨 Humidity (%):</label>
            <input type="number" step="0.1" name="Humidity" required>

            <button type="submit"> Predict Yield</button>
          </form>
          <div class="footer"></div>
        </div>
        <div id="loader"><div class="spinner"></div></div>
      </body>
      </html>
    `);
  } catch (err) {
    res.send("Error fetching options from backend: " + err);
  }
});

// Handle prediction
app.post("/predict", async (req, res) => {
  try {
    const { Crop_Type, Soil_Type, Weather_Condition, Temperature, Raifall, Humidity } = req.body;

    const response = await axios.post(`${API_URL}/predict_yield`, {
      Crop_Type,
      Soil_Type,
      Weather_Condition,
      Temperature: parseFloat(Temperature),
      Raifall: parseFloat(Raifall),
      Humidity: parseFloat(Humidity)
    });

    res.send(`
      <html>
      <head>
        <title>Prediction Result</title>
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #95d5b2, #52b788);
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .result {
            background: rgba(255, 255, 255, 0.9);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0px 8px 24px rgba(0,0,0,0.2);
            text-align: center;
            animation: fadeIn 1s ease-in-out;
          }
          h1 {
            color: #1b4332;
            margin-bottom: 20px;
          }
          p {
            font-size: 18px;
            color: #333;
          }
          .yield-value {
            font-size: 28px;
            color: #2d6a4f;
            font-weight: bold;
            margin: 15px 0;
          }
          a {
            display: inline-block;
            margin-top: 20px;
            text-decoration: none;
            padding: 12px 20px;
            background: #2d6a4f;
            color: white;
            border-radius: 10px;
            transition: 0.3s;
          }
          a:hover {
            background: #40916c;
            transform: scale(1.05);
          }
          @keyframes fadeIn {
            from {opacity: 0; transform: translateY(20px);}
            to {opacity: 1; transform: translateY(0);}
          }
        </style>
      </head>
      <body>
        <div class="result">
          <h1>Prediction Complete!</h1>
          <p>Your predicted yield is:</p>
          <div class="yield-value">${response.data.predicted_yield}</div>
          <a href="/">🔙 Make Another Prediction</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.send("Error making prediction: " + err);
  }
});

// Start server
app.listen(3000, () => console.log("Frontend running at http://localhost:3000"));
