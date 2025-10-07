# trainer.py
import sys
import re
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder

TARGET_KEYWORDS = ["yield", "production", "crop_yield", "yield_tons", "yield_tons_hectare"]

def normalize_col(c: str) -> str:
    """Lowercase, remove units/parentheses, replace spaces and punctuation with underscore."""
    c = str(c)
    c = re.sub(r"\(.*?\)", "", c)             
    c = re.sub(r"[^0-9a-zA-Z]+", "_", c)      
    c = c.strip("_").lower()
    return c

def find_target_column(df: pd.DataFrame):
    """Try to find a target column using normalized names and keywords. Return original column name."""
    norm_map = {col: normalize_col(col) for col in df.columns}
    for orig, norm in norm_map.items():
        for kw in TARGET_KEYWORDS:
            if kw in norm:
                return orig
    for orig, norm in norm_map.items():
        if "yield" in norm:
            return orig
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if numeric_cols:
        return numeric_cols[-1]
    return None

def train_and_save_model(dataset_path: str = "../data/crop_yield_dataset.csv", model_path: str = "model_pipeline.pkl"):
    print(f"Loading dataset from: {dataset_path}")
    try:
        df = pd.read_csv(dataset_path)
    except FileNotFoundError:
        print("ERROR: dataset file not found. Make sure the CSV is in the same folder and the filename is correct.")
        sys.exit(1)
    except Exception as e:
        print("ERROR reading CSV:", e)
        sys.exit(1)

    print("Original columns:", list(df.columns))
    target_col = find_target_column(df)
    if target_col is None:
        print("\nCould not find a target column automatically.")
        print("Please ensure your CSV has a target column (e.g. 'Yield', 'Yield (tons/hectare)').")
        sys.exit(1)

    print(f"Detected target column: '{target_col}'")
    df = df.dropna(subset=[target_col]).copy()

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    feature_numeric = [c for c in numeric_cols if c != target_col]

    categorical_cols = [c for c in df.columns if c not in feature_numeric + [target_col] and c != target_col]

    if not feature_numeric and not categorical_cols:
        print("No features found. Ensure your CSV has feature columns (numeric or categorical).")
        sys.exit(1)

    print("Numeric features:", feature_numeric)
    print("Categorical features:", categorical_cols)

    # Build preprocessors
    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median"))
    ])
    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse=False))
    ])

    preprocessor = ColumnTransformer(transformers=[
        ("num", numeric_transformer, feature_numeric),
        ("cat", categorical_transformer, categorical_cols)
    ], remainder="drop")

    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("model", RandomForestRegressor(n_estimators=100, random_state=42))
    ])

    X = df[feature_numeric + categorical_cols]
    y = pd.to_numeric(df[target_col], errors="coerce")
    valid_idx = y.notna()
    X = X.loc[valid_idx]
    y = y.loc[valid_idx].astype(float)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training model...")
    pipeline.fit(X_train, y_train)

    
    preds = pipeline.predict(X_test)
    mse = mean_squared_error(y_test, preds)
    print(f"Quick eval on test set -- MSE: {mse:.4f}, RMSE: {mse**0.5:.4f}")

    metadata = {
        "pipeline": pipeline,
        "target_column": target_col,
        "numeric_features": feature_numeric,
        "categorical_features": categorical_cols
    }
    joblib.dump(metadata, model_path)
    print(f"Pipeline+model saved to {model_path}")

    sample_X = X_test.iloc[:1]
    sample_pred = pipeline.predict(sample_X)[0]
    print("Sample input (first test row):")
    print(sample_X.to_dict(orient="records")[0])
    print("Predicted target:", float(sample_pred))
    print("Actual target:", float(y_test.iloc[0]))

if __name__ == "__main__":
    train_and_save_model()
