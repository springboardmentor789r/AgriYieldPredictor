# train_pipeline.py
import os
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.linear_model import Ridge
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error

# -------- CONFIG ----------
DATA_PATHS = ["raw_data.csv"]
TARGET_COLUMN = "Yield_tons_per_hectare"   # from your sample

NUMERIC_FEATURES = [
    "Rainfall_mm",
    "Temperature_Celsius",
    "Days_to_Harvest",
]

BINARY_FEATURES = [
    "Fertilizer_Used",
    "Irrigation_Used",
]

CATEGORICAL_FEATURES = [
    "Region",
    "Soil_Type",
    "Crop",
    "Weather_Condition",
]

OUT_MODEL = "crop_yield_pipeline.joblib"
OUT_CATEGORIES = "categories.joblib"
OUT_FEATURE_COLS = "feature_columns.joblib"
RANDOM_STATE = 42
# -------------------------

# find a CSV file
df = None
data_file = None
for p in DATA_PATHS:
    if os.path.exists(p):
        df = pd.read_csv(p)
        data_file = p
        print("Using data file:", p)
        break

if df is None:
    raise FileNotFoundError(f"No CSV found. Put your CSV as one of {DATA_PATHS}")

if TARGET_COLUMN not in df.columns:
    raise ValueError(f"Target column '{TARGET_COLUMN}' not present in {data_file}")

# convert boolean-like columns to numeric 0/1
for b in BINARY_FEATURES:
    if b in df.columns:
        df[b] = df[b].map({True: 1, False: 0, "True": 1, "False": 0}).fillna(df[b])
        try:
            df[b] = df[b].astype(float)
        except Exception:
            df[b] = pd.to_numeric(df[b], errors="coerce").fillna(0.0)

# define X, y
numeric_present = [c for c in NUMERIC_FEATURES if c in df.columns]
binary_present = [c for c in BINARY_FEATURES if c in df.columns]
categorical_present = [c for c in CATEGORICAL_FEATURES if c in df.columns]

X = df[numeric_present + binary_present + categorical_present]
y = df[TARGET_COLUMN]

# split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=RANDOM_STATE)

# preprocessor
scaler_features = numeric_present + binary_present

preprocessor = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), scaler_features),
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_present),
    ],
    remainder="drop"
)

pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("regressor", Ridge())
])

# grid search
param_grid = {"regressor__alpha": [0.01, 0.1, 1.0, 10.0, 100.0]}
grid = GridSearchCV(pipeline, param_grid, cv=5, scoring="r2", n_jobs=-1, verbose=1)

print("Fitting grid search...")
grid.fit(X_train, y_train)

best_model = grid.best_estimator_
print("Best params:", grid.best_params_)

# metrics
y_pred = best_model.predict(X_test)
print("R2:", r2_score(y_test, y_pred))
print("MSE:", mean_squared_error(y_test, y_pred))
print("MAE:", mean_absolute_error(y_test, y_pred))

# Save model and metadata
joblib.dump(best_model, OUT_MODEL)
print(f"Saved pipeline to {OUT_MODEL}")

categories = {c: sorted(df[c].dropna().unique().tolist()) for c in categorical_present}
joblib.dump(categories, OUT_CATEGORIES)
print(f"Saved categories to {OUT_CATEGORIES}")

# save metadata about columns
try:
    preproc = best_model.named_steps["preprocessor"]
    num_names = scaler_features
    cat_encoder = preproc.named_transformers_["cat"]
    cat_names = cat_encoder.get_feature_names_out(categorical_present).tolist()
    feature_columns = num_names + cat_names
except Exception:
    feature_columns = X.columns.tolist()

joblib.dump(
    {"input_columns": X.columns.tolist(), "transformed_feature_names": feature_columns},
    OUT_FEATURE_COLS
)
print(f"Saved feature metadata to {OUT_FEATURE_COLS}")
