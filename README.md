## 🌾 AgriYield AI

### Intelligent Crop Yield Prediction and 7-Day Forecast Platform

---

### 🧭 Overview

**AgriYield AI** is a dual-backend, full-stack AI platform for precision agriculture.
It helps farmers and policymakers:

* Predict **crop yield** based on soil, weather, and management factors
* Forecast **future yields for the next 7 days** using hybrid time-series models

The system combines:

* 🧠 **Machine Learning (Ridge + LightGBM)** for short-term yield prediction
* 📈 **Time-Series Forecasting (SARIMAX + LightGBM)** for yield trend projection
* 💻 **Modern Web Frontend** (React + Vite + TailwindCSS) for easy user interaction

---

### 🏗️ Project Architecture

```
Agri_Yield/
├── backend/
│   ├── crop_yield/               # FastAPI backend for static yield prediction
│   │   ├── app.py
│   │   ├── model/
│   │   │   ├── crop_yield_pipeline.joblib
│   │   │   ├── categories.joblib
│   │   │   ├── feature_columns.joblib
│   │   │   └── train_pipeline.py
│   │   └── requirements.txt
│   │
│   └── time_series_forecast/     # FastAPI backend for 7-day forecasting
│       ├── app.py
│       ├── model/
│       │   └── hybrid_model.joblib
│       ├── requirements.txt
│       └── environment.yml
│
├── crop-yield-frontend/          # React frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/
│   │   │   ├── PredictForm.jsx
│   │   │   ├── ForecastPage.jsx
│   │   │   └── ForecastGraph.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── README.md
│
└── README.md                     # (this file)
```

---

### ⚙️ Setup Instructions

#### 1️⃣ Clone the repository

```bash
git clone https://github.com/<your-username>/Agri_Yield.git
cd Agri_Yield
```

---

### 🧩 Backend Setup (Two Separate FastAPI Services)

Each backend runs independently due to differing ML dependencies.
You’ll need **two Python virtual environments**:

#### 🧮 Crop Yield Predictor

```bash
cd backend/crop_yield
python -m venv venv_crop_yield
venv_crop_yield\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

Access: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

#### 🌾 Time-Series Forecast (7-Day)

```bash
cd ../time_series_forecast
python -m venv venv_forecast
venv_forecast\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8001
```

Access: [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs)

---

### 💻 Frontend Setup

```bash
cd ../../crop-yield-frontend
npm install
npm run dev
```

Then open the local URL shown (usually):

```
http://127.0.0.1:5173/
```

---

### 🌐 API Integration

| Function             | Backend                        | Port   | Description                           |
| -------------------- | ------------------------------ | ------ | ------------------------------------- |
| Crop Yield Predictor | `backend/crop_yield`           | `8000` | Predicts static yield from inputs     |
| 7-Day Forecast       | `backend/time_series_forecast` | `8001` | Predicts yield trends for next 7 days |
| Frontend App         | `crop-yield-frontend`          | `5173` | React dashboard UI                    |

> The frontend automatically connects to both backends using their ports.

---
<img width="1919" height="906" alt="image" src="https://github.com/user-attachments/assets/69559dcd-9887-4821-b0eb-7178358c7fb0" />
<img width="1897" height="816" alt="image" src="https://github.com/user-attachments/assets/69883fe2-b15a-4d7d-8099-026262168365" />
<img width="1339" height="356" alt="image" src="https://github.com/user-attachments/assets/143c178e-fc36-4f96-9e99-b36c0c9d5008" />
<img width="1899" height="906" alt="image" src="https://github.com/user-attachments/assets/04f2e9e2-c189-42e1-ab80-2f921e149f00" />





### 🧠 Features

* **Dual ML Engines**:

  * Crop yield prediction from structured farm data
  * Time-series forecast combining SARIMAX and LightGBM
* **Frontend Dashboard**:

  * Input forms for yield prediction and forecasting
  * Interactive chart visualization (Recharts)
* **Full FastAPI + React Integration**
* **Portable, modular project structure**

---

### 📊 Tech Stack

| Layer       | Technology                                    |
| ----------- | --------------------------------------------- |
| Frontend    | React (Vite), TailwindCSS, Axios, Recharts    |
| Backend     | FastAPI, Uvicorn                              |
| ML Models   | scikit-learn, LightGBM, Statsmodels, Pmdarima |
| Environment | Python 3.10+, Node.js 18+, npm                |

---

### 🙌 Authors & Credits

Developed for **Infosys Springboard AI Internship Project**.

---

Would you like me to make it more **GitHub-optimized** (badges, quick-start code block, visual architecture diagram, etc.) for a professional profile-ready README?
