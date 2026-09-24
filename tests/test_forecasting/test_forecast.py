"""
Tests for forecasting constraints (chronological split validation, forecast logic).
"""

import pytest
import pandas as pd


def test_chronological_split_integrity():
    # Verify that chronological train/val/test splits do not shuffle or leak future data
    dates = pd.date_range("2024-01-01", periods=100, freq="D")
    df = pd.DataFrame({"date": dates, "demand": range(100)})

    train_idx = int(len(df) * 0.70)
    val_idx = int(len(df) * 0.85)

    train_df = df.iloc[:train_idx]
    val_df = df.iloc[train_idx:val_idx]
    test_df = df.iloc[val_idx:]

    assert train_df["date"].max() < val_df["date"].min(), "Train dates must precede Val dates!"
    assert val_df["date"].max() < test_df["date"].min(), "Val dates must precede Test dates!"
    assert len(train_df) + len(val_df) + len(test_df) == len(df)
