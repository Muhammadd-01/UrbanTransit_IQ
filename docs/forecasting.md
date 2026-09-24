# UrbanTransit IQ — Time-Series Forecasting Guide
Methodologies for passenger demand and occupancy forecasting:
- Chronological splitting: Months 1-8 train, 9-10 validation, 11-12 test.
- Models: Seasonal Naive baseline, SARIMA (weekly cycle s=7), Lagged XGBoost Regressors.
- Performance metrics: MAE, RMSE, MAPE.
