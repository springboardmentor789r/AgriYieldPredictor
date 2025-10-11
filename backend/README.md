# Crop Yield Prediction API

This is a FastAPI backend for the Crop Yield Prediction application.

## Setup

1. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Backend

1. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

2. The API will be available at `http://localhost:8000`

3. You can view the API documentation at:
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

## API Endpoints

- `GET /`: Health check endpoint
- `POST /predict`: Get crop yield prediction

## Frontend Development

The frontend should be run from the project root directory:

```bash
cd ..
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Notes

- The current implementation uses a simple mock prediction model. To use a real machine learning model:
  1. Train your model and save it using joblib
  2. Update the `predict_yield` function in `main.py` to load and use your model
  3. Update the input validation and preprocessing as needed
