AgriYield Project - README (Version1)

1) What this is
- Backend: FastAPI with endpoints
  - GET /health: server status and available endpoints
  - POST /predict: single yield prediction from tabular inputs using pipeline.pkl
  - POST /predict_trend: daily yield values for any date range (historical + predicted)
- Frontend: React (Vite) app with pages: Home, Predict, Trend, Insights
- Data: time series file (Version1\required\crop_date_yield.csv preferred; fallback at Version1\crop_date_yield.csv or Version1\fastapi\crop_date_yield.csv); model pipeline at Version1\fastapi\pipeline.pkl

2) Prerequisites (on any Windows machine)
- Python 3.12+ (python in PATH)
- Node.js 18+ (npm in PATH)

3) One‑time setup (first run on a new machine)
Backend deps
  PowerShell:
    cd Version1\fastapi
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    pip install -r ..\required\requirements.txt
Frontend deps
  PowerShell:
    cd Version1\frontend
    npm install

4) Start both servers (recommended)
- Double‑click Version1\run_all.bat
  - Backend: http://127.0.0.1:8000 (interactive docs at /docs)
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
- Note: In Version1 UI, this prediction is calculated locally in the browser (App.jsx) and does not call the backend by default.

Trend page
- Enter any From and To dates (YYYY‑MM‑DD). The range can be in the past, within, or beyond the dataset.
- The page calls the backend /predict_trend API and shows:
  - Summary stats (average, max, min yield, trend type, counts of historical vs predicted days)
  - An area chart of predicted_yield over time with a custom tooltip
  - Data points are labeled as "historical" or "predicted" with confidence ranges

7) API reference (for integrations)
Base URL: http://127.0.0.1:8000

GET /health
Response
{
  "status": "healthy",
  "message": "Crop Yield Predictor API is running",
  "endpoints": ["/predict", "/predict_trend", "/health"]
}

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

POST /predict_trend
Body
{ "from_date": "YYYY-MM-DD", "to_date": "YYYY-MM-DD" }
Response
{
  "status": "success",
  "from_date": "YYYY-MM-DD",
  "to_date": "YYYY-MM-DD",
  "predictions": [
    {
      "date": "YYYY-MM-DD",
      "predicted_yield": number,
      "data_type": "historical"|"predicted",
      "confidence_lower": number,
      "confidence_upper": number
    },
    ...
  ],
  "statistics": {
    "average_yield": number,
    "max_yield": number,
    "min_yield": number,
    "trend": "increasing"|"decreasing"|"stable",
    "total_days": number,
    "historical_days": number,
    "predicted_days": number
  }
}
Notes
- Historical values for dates within the dataset; simplified seasonal prediction for future dates
- Data is read from Version1\required\crop_date_yield.csv when available; otherwise from project root or fastapi folder. The series is daily and time‑interpolated.

8) Sample tests
- Use Version1\test_backend.py to quickly verify the backend (requires "requests" package)
PowerShell examples
# Health
python .\test_backend.py

# Direct curl examples
curl -Method GET -Uri http://127.0.0.1:8000/health
curl -Method POST -Uri http://127.0.0.1:8000/predict -ContentType 'application/json' -Body '{ "temperature":25.5, "humidity":65.0, "soil_type":"Loamy", "rainfall":120.0, "weather_condition":"Sunny", "crop_type":"Rice" }'
curl -Method POST -Uri http://127.0.0.1:8000/predict_trend -ContentType 'application/json' -Body '{ "from_date":"2014-01-01", "to_date":"2014-01-10" }'

9) Project structure (key files)
Version1\
  fastapi\main.py            # API endpoints (/predict, /trend)
  fastapi\pipeline.pkl       # Model pipeline loaded by /predict
  frontend\src\App.jsx       # UI (Predict, Trend, Insights)
  required\crop_date_yield.csv  # Preferred time series used by /predict_trend
  crop_date_yield.csv           # Fallback location for the time series
  run_all.bat                # Starts backend and frontend
  required\requirements.txt  # Python deps (install from fastapi dir)
  test_backend.py            # Simple health and trend tests
  required\readme.txt        # This file

10) Configuration and ports
- Backend default: 8000; Frontend default: 5173
- If you change backend port, update the fetch URL in frontend src\App.jsx (Trend page fetch)
- CORS is open for development

11) Troubleshooting
- Frontend says "Failed to fetch":
  - Ensure backend is running: open http://localhost:8000/docs
  - Ensure frontend dev server is running and you are using the printed URL
  - Allow Windows firewall access when uvicorn first starts
- /predict_trend errors or empty results:
  - Confirm Version1\required\crop_date_yield.csv exists and has a Date column named "Date" and a numeric column "Crop_Yield"
  - Ensure valid ISO dates and from_date < to_date
- Missing packages:
  - Activate venv and run: pip install -r ..\required\requirements.txt

12) Production notes
- Build frontend: cd Version1\frontend && npm run build
- Serve backend with uvicorn/gunicorn and a process manager; serve built frontend via a static file server or reverse proxy 