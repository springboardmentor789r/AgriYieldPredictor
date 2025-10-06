# 🌾 Backend – AgriYield AI (Dual FastAPI Services)

This backend hosts **two independent FastAPI microservices**:
1. **Crop Yield Prediction API** – predicts expected yield based on environmental and agricultural factors.
2. **Time Series Forecast API** – forecasts yield trends for the next 7 days using hybrid SARIMAX + LightGBM models.

---

## 🧩 Directory Structure

backend/
├── crop_yield/ # Crop yield prediction backend
│ ├── app.py
│ ├── requirements.txt
│ ├── crop_yield_pipeline.joblib
│ ├── feature_columns.joblib
│ └── (other model files)
│
└── time_series_forecast/ # Time series forecasting backend
├── app.py
├── requirements.txt
├── model/
│ └── hybrid_model.joblib
└── (other data/model files)

yaml
Copy code

---

## ⚙️ Environment Setup

These two backends have **different dependencies** (due to model and library version conflicts),  
so it’s recommended to create **two separate virtual environments**.

---

### 🧮 1️⃣ Crop Yield Prediction Backend

#### 📍 Location:
backend/crop_yield/

r
Copy code

#### 🧰 Setup Steps (Windows PowerShell)
```bash
cd backend/crop_yield
python -m venv venv_crop_yield
venv_crop_yield\Scripts\activate
pip install -r requirements.txt
▶️ Run API
bash
Copy code
uvicorn app:app --reload --port 8000
🌐 Access
Once running, open:

arduino
Copy code
http://127.0.0.1:8000/docs
🌾 2️⃣ Time Series Forecast Backend
📍 Location:
bash
Copy code
backend/time_series_forecast/
🧰 Setup Steps (Windows PowerShell)
bash
Copy code
cd backend/time_series_forecast
python -m venv venv_forecast
venv_forecast\Scripts\activate
pip install -r requirements.txt
▶️ Run API
bash
Copy code
uvicorn app:app --reload --port 8001
🌐 Access
Once running, open:

arduino
Copy code
http://127.0.0.1:8001/docs
⚡ Backend Summary
Service	Port	Description
Crop Yield Predictor	8000	Predicts yield from soil, region, crop, and weather features
7-Day Forecast	8001	Generates short-term yield forecasts using time-series models

🧩 Integration Notes
Both services are used by the frontend (React app) located in /frontend/.

The React app connects to:

http://127.0.0.1:8000 → Crop Yield API

http://127.0.0.1:8001 → 7-Day Forecast API

Make sure both servers are running before starting the frontend.

🧠 Developer Tips
If installation fails due to numpy or statsmodels version conflicts:

Use Python 3.10 or 3.11 (recommended).

Install requirements exactly as specified per backend.

To deactivate any environment:

bash
Copy code
deactivate