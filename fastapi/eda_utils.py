import pandas as pd
from typing import Dict, Any

def get_eda_summary(df: pd.DataFrame) -> Dict[str, Any]:
    summary = {
        "columns": list(df.columns),
        "shape": df.shape,
        "describe": df.describe(include='all').to_dict(),
        "nulls": df.isnull().sum().to_dict(),
        "head": df.head(5).to_dict(orient="records"),
    }
    return summary
