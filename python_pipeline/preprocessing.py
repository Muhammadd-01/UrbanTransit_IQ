import pandas as pd
import numpy as np
import logging

logger = logging.getLogger(__name__)

def remove_outliers_iqr(df, column):
    if column not in df.columns or not pd.api.types.is_numeric_dtype(df[column]):
        return df
    
    Q1 = df[column].quantile(0.25)
    Q3 = df[column].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    
    # Cap outliers
    df[column] = np.clip(df[column], lower_bound, upper_bound)
    return df

def clean_data(dataframes_dict):
    """Clean all dataframes."""
    cleaned = {}
    stats = {}
    
    for name, df in dataframes_dict.items():
        if df.empty:
            cleaned[name] = df
            continue
            
        initial_len = len(df)
        
        # 1. Drop duplicates
        df = df.drop_duplicates()
        
        # 2. Handle missing values
        for col in df.columns:
            if pd.api.types.is_numeric_dtype(df[col]):
                df[col] = df[col].fillna(df[col].median())
            else:
                df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else "UNKNOWN")
                
        # 3. Handle impossible values / Cap outliers
        if name == 'passenger_counts' and 'boarding_count' in df.columns:
            df.loc[df['boarding_count'] < 0, 'boarding_count'] = 0
            df = remove_outliers_iqr(df, 'boarding_count')
            
        if name == 'delays' and 'delay_minutes' in df.columns:
            df.loc[df['delay_minutes'] < -30, 'delay_minutes'] = -30
            df = remove_outliers_iqr(df, 'delay_minutes')
            
        final_len = len(df)
        stats[name] = {
            'initial_records': initial_len,
            'final_records': final_len,
            'dropped_duplicates': initial_len - final_len
        }
        
        cleaned[name] = df
        
    return cleaned, stats
