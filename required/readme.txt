AgriYield Project - README

1) What this is
- Backend: FastAPI with two endpoints
  - POST /predict: single yield prediction from tabular inputs
  - POST /trend: daily yield values for any date range using ARIMA+SARIMAX (returned as one "yield_prediction" per day)
- Frontend: React (Vite) app with pages: Home, Predict, Trend, Insights
- Data: time series file at Version1\crop_date_yield.csv; model pipeline at Version1\fastapi\pipeline.pkl

2) Prerequisites (on any Windows machine)
- Python 3.12+ (python in PATH)
- Node.js 18+ (npm in PATH)

3) One‑time setup (first run on a new machine)
Backend deps
  PowerShell:
    cd Version1\fastapi
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    pip install -r ..\requirements.txt
Frontend deps
  PowerShell:
    cd Version1\frontend
    npm install

4) Start both servers (recommended)
- Double‑click Version1\run_all.bat
  - Backend: http://localhost:8000 (interactive docs at /docs)
  - Frontend: shown in the terminal (usually http://localhost:5173)
- If a window closes, run from PowerShell to see logs:
  cd Version1
  .\run_all.bat

5) Start manually (alternative)
Backend
  cd Version1\fastapi
  .\venv\Scripts\Activate.ps1
  python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
Frontend
  cd Version1\frontend
  npm run dev

6) Using the app
Predict page
- Enter: Temperature, Rainfall, Humidity, Soil Type, Weather, Crop Type
- Submit to see a single predicted yield (tons/ha)

Trend page
- Enter any From and To dates (YYYY‑MM‑DD). The range can be in the past, within, or beyond the dataset
- You will see a two‑column table: Date, Yield Prediction

7) API reference (for integrations)
Base URL: http://localhost:8000

POST /predict
Body
{
  "temperature": number,
  "humidity": number,
  "soil_type": "Sandy"|"Loamy"|"Peaty"|"Clay"|"Silty",
  "rainfall": number,
  "weather_condition": "Sunny"|"Rainy"|"Stormy"|"Cloudy",
  "crop_type": "Rice"|"Corn"|"Barley"|"Soybeans"|"Wheat"
}
Response
{ "predicted_yield_tons_per_hectare": number }

POST /trend
Body
{ "from_date": "YYYY-MM-DD", "to_date": "YYYY-MM-DD" }
Response
{
  "from_date": "YYYY-MM-DD",
  "to_date": "YYYY-MM-DD",
  "rows": [ { "date": "YYYY-MM-DD", "yield_prediction": number|null }, ... ]
}
Notes
- In‑sample values for dates within history; out‑of‑sample forecasts for future dates
- Data is read from Version1\crop_date_yield.csv and preprocessed to daily frequency with time interpolation

8) Sample tests
- See Version1\test.txt for 8 ready‑to‑use /predict payloads
PowerShell example
curl -Method POST -Uri http://localhost:8000/predict -ContentType 'application/json' -Body '{ "temperature":25.5, "humidity":65.0, "soil_type":"Loamy", "rainfall":120.0, "weather_condition":"Sunny", "crop_type":"Rice" }'

9) Project structure (key files)
Version1\
  fastapi\main.py            # API endpoints (/predict, /trend)
  fastapi\pipeline.pkl       # Model pipeline loaded by /predict
  frontend\src\App.jsx       # UI (Predict, Trend, Insights)
  crop_date_yield.csv        # Time series used by /trend
  run_all.bat                # Starts backend and frontend
  requirements.txt           # Python deps (install from fastapi dir)
  test.txt                   # /predict request samples
  readme.txt                 # This file

10) Configuration and ports
- Backend default: 8000; Frontend default: 5173
- If you change backend port, update the fetch URL in frontend src\App.jsx (Trend page fetch)
- CORS is open for development

11) Troubleshooting
- Frontend says "Failed to fetch":
  - Ensure backend is running: open http://localhost:8000/docs
  - Ensure frontend dev server is running and you are using the printed URL
  - Allow Windows firewall access when uvicorn first starts
- /trend errors or empty rows:
  - Confirm Version1\crop_date_yield.csv exists and has a Date column
  - Ensure valid ISO dates and from_date <= to_date
- Missing packages:
  - Activate venv and run: pip install -r ..\requirements.txt

12) Production notes
- Build frontend: cd Version1\frontend && npm run build
- Serve backend with uvicorn/gunicorn and a process manager; serve built frontend via a static file server or reverse proxy 