# models/encoders.py
class LabelEncoderWrapper:
    def __init__(self, encoder):
        self.encoder = encoder

    def fit(self, X, y=None):
        return self.encoder.fit(X)

    def transform(self, X):
        return self.encoder.transform(X)

    def fit_transform(self, X, y=None):
        return self.encoder.fit_transform(X)

    def inverse_transform(self, X):
        return self.encoder.inverse_transform(X)