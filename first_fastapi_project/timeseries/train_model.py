import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import joblib
from utils import preprocess_data, run_adf_test, exog_cols


def load_and_prepare(path):
    df = pd.read_csv(path, parse_dates=['Date'], dayfirst=True)

    df.set_index('Date', inplace=True)
    df.index = pd.to_datetime(df.index)

    # ✅ drop exact duplicate rows
    df = df[~df.index.duplicated(keep='first')]

    # ✅ generate Year column if not present
    if 'Year' not in df.columns:
        df['Year'] = df.index.year

    # ✅ only keep relevant columns
    cols_needed = [c for c in exog_cols if c in df.columns] + ['Crop_Yield']
    df = df[cols_needed].copy()

    # Separate numeric and categorical
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    categorical_cols = df.select_dtypes(exclude=[np.number]).columns

    # Resample numeric columns daily (mean)
    df_numeric = df[numeric_cols].resample('D').mean()

    # Resample categorical by forward-filling
    if len(categorical_cols) > 0:
        df_categorical = df[categorical_cols].resample('D').ffill()
        df = pd.concat([df_numeric, df_categorical], axis=1)
    else:
        df = df_numeric

    # Fill missing values
    df.ffill(inplace=True)
    df.interpolate(method='time', inplace=True)

    # Ensure Crop_Yield exists
    df.dropna(subset=['Crop_Yield'], inplace=True)

    return df


def prepare_exog(df):
    existing_cols = [c for c in exog_cols if c in df.columns]
    if not existing_cols:
        print("⚠️ No exogenous columns found.")
        return None, None

    exog = df[existing_cols].copy()

    categorical = [c for c in exog.columns if exog[c].dtype == 'object' or exog[c].nunique() < 20]
    numeric = [c for c in exog.columns if c not in categorical]

    transformers = []
    if numeric:
        numeric_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='mean')),
            ('scaler', StandardScaler())
        ])
        transformers.append(('num', numeric_transformer, numeric))

    if categorical:
        categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('onehot', OneHotEncoder(handle_unknown='ignore'))
        ])
        transformers.append(('cat', categorical_transformer, categorical))

    if not transformers:
        return None, None

    preprocessor = ColumnTransformer(transformers=transformers)
    exog_transformed = preprocessor.fit_transform(exog)

    # ✅ convert sparse to dense for ARIMA
    if hasattr(exog_transformed, "toarray"):
        exog_transformed = exog_transformed.toarray()

    if exog_transformed.ndim == 1:
        exog_transformed = exog_transformed.reshape(-1, 1)

    return exog_transformed, preprocessor


def train_arima(df):
    y = df['Crop_Yield']

    exog, preprocessor = prepare_exog(df)

    run_adf_test(y)

    if exog is None or exog.shape[1] == 0:
        print("⚠️ Training ARIMA without exogenous variables.")
        model = ARIMA(y, order=(1, 1, 1))
    else:
        model = ARIMA(y, exog=exog, order=(1, 1, 1))

    model_fit = model.fit()
    return model_fit, preprocessor



if __name__ == "__main__":
    data_path = r"E:\infosys\crop_yield_dataset_extended.csv" 
    df = load_and_prepare(data_path)

    model_fit, preprocessor = train_arima(df)

    # Save model and preprocessor
    joblib.dump(model_fit, "arima_model.pkl")
    joblib.dump(preprocessor, "preprocessor.pkl")

    print("✅ Model and preprocessor saved successfully!")
