# UrbanTransit IQ — Independent Python Pipeline Manual
Details Pipeline B using Pandas, Scikit-learn, XGBoost, and Statsmodels.
- Completely decoupled from Spark (never consumes Spark outputs)
- Independent data loading from `data/raw/*.csv` (`python_pipeline/data_loader.py`)
- Vectorized IQR cleaning and outlier clipping (`python_pipeline/preprocessing.py`)
- Chronological train/val/test splits (70/15/15)
- Independent model training and evaluation (`python_pipeline/delay_prediction.py`)
