import joblib
import pandas as pd
from typing import Dict

MODEL_PATH = "../models/model_pipeline.pkl"

def load_pipeline(model_path: str = MODEL_PATH):
    obj = joblib.load(model_path)
    if isinstance(obj, dict) and "pipeline" in obj:
        return obj
    return {"pipeline": obj, "numeric_features": [], "categorical_features": [], "target_column": None}

def prepare_input_dict_for_pipeline(req: Dict, metadata: Dict):
    numeric = metadata.get("numeric_features", [])
    categorical = metadata.get("categorical_features", [])
    cols = numeric + categorical

    def find_value(key):
        candidates = [
            key,
            key.replace("_", " "),
            key.replace("_", " ") + " (°C)",
            key + " (°C)",
            key + " (mm)",
            key + " (tons/hectare)",
            key.capitalize()
        ]
        for c in candidates:
            if c in req:
                return req[c]
        return req.get(key)

    data = {}
    for c in cols:
        base = c
        base = base.split("(")[0].strip()
        base = base.replace(" ", "_")
        val = find_value(base)
        if val is None:
            val = req.get(c)
        data[c] = val

    df = pd.DataFrame([data], columns=cols)
    return df
