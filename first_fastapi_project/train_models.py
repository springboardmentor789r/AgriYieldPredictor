import pandas as pd
import joblib
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LinearRegression

from models.encoders import LabelEncoderWrapper  # ✅ Import from module

# 🔢 Sample training data
data = pd.DataFrame({
    "Temperature": [25, 30, 22, 28, 26],
    "Rainfall": [100, 120, 90, 110, 105],
    "Humidity": [60, 65, 55, 70, 62],
    "Soil_Type": ["Sandy", "Loamy", "Clay", "Silty", "Peaty"],
    "Weather_Condition": ["Sunny", "Rainy", "Cloudy", "Stormy", "Sunny"],
    "Crop_Type": ["Wheat", "Rice", "Corn", "Barley", "Soybeans"],
    "Yield": [3.5, 4.2, 3.0, 3.8, 4.0]
})

# 🎯 Encode categorical features
soil_encoder = LabelEncoderWrapper(LabelEncoder())
weather_encoder = LabelEncoderWrapper(LabelEncoder())
crop_encoder = LabelEncoderWrapper(LabelEncoder())

data["Soil_Type"] = soil_encoder.fit_transform(data["Soil_Type"])
data["Weather_Condition"] = weather_encoder.fit_transform(data["Weather_Condition"])
data["Crop_Type"] = crop_encoder.fit_transform(data["Crop_Type"])

# 🧪 Features and target
X = data.drop("Yield", axis=1)
y = data["Yield"]

# 🛠 Build pipeline
pipeline = Pipeline([
    ("regressor", LinearRegression())
])

pipeline.fit(X, y)

# 💾 Save pipeline and encoders
joblib.dump(pipeline, "models/yield_pipeline.pkl")
joblib.dump(soil_encoder, "models/soil_encoder.pkl")
joblib.dump(weather_encoder, "models/weather_encoder.pkl")
joblib.dump(crop_encoder, "models/crop_encoder.pkl")

print("✅ Training complete. Model and encoders saved in 'models/' folder")