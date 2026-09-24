import os
import json
import pandas as pd
import numpy as np
import logging
from sklearn.ensemble import IsolationForest

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def detect_anomalies_zscore(df, column, threshold=3.0):
    if df.empty or column not in df.columns:
        return pd.DataFrame()
        
    mean = df[column].mean()
    std = df[column].std()
    
    if std == 0:
        return pd.DataFrame()
        
    z_scores = np.abs((df[column] - mean) / std)
    anomalies = df[z_scores > threshold].copy()
    anomalies['anomaly_score'] = z_scores[z_scores > threshold]
    anomalies['anomaly_method'] = 'Z-Score'
    anomalies['anomaly_explanation'] = anomalies.apply(
        lambda row: f"{column} value {row[column]:.2f} is {row['anomaly_score']:.2f} standard deviations from mean {mean:.2f}", 
        axis=1
    )
    return anomalies

def detect_anomalies_iqr(df, column):
    if df.empty or column not in df.columns:
        return pd.DataFrame()
        
    Q1 = df[column].quantile(0.25)
    Q3 = df[column].quantile(0.75)
    IQR = Q3 - Q1
    
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    
    anomalies = df[(df[column] < lower_bound) | (df[column] > upper_bound)].copy()
    anomalies['anomaly_score'] = 1.0  # Simple boolean flag for IQR
    anomalies['anomaly_method'] = 'IQR'
    anomalies['anomaly_explanation'] = anomalies.apply(
        lambda row: f"{column} value {row[column]:.2f} is outside IQR bounds [{lower_bound:.2f}, {upper_bound:.2f}]", 
        axis=1
    )
    return anomalies

def detect_anomalies_isolation_forest(df, columns, contamination=0.05):
    if df.empty or not all(c in df.columns for c in columns):
        return pd.DataFrame()
        
    # Drop NaNs for IF
    clean_df = df.dropna(subset=columns).copy()
    if clean_df.empty:
        return pd.DataFrame()
        
    clf = IsolationForest(contamination=contamination, random_state=42)
    clf.fit(clean_df[columns])
    
    scores = clf.decision_function(clean_df[columns])
    predictions = clf.predict(clean_df[columns])
    
    anomalies = clean_df[predictions == -1].copy()
    anomalies['anomaly_score'] = -scores[predictions == -1] # Negative score for anomaly, invert for reporting
    anomalies['anomaly_method'] = 'IsolationForest'
    anomalies['anomaly_explanation'] = f"Flagged by Isolation Forest on columns {columns}"
    return anomalies

def main():
    logger.info("Starting anomaly detection...")
    # This would ideally load cleaned data
    # For now, we mock the pipeline structure
    pass

if __name__ == '__main__':
    main()
