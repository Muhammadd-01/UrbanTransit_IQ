"""
Tests for ML evaluation utilities and models.
"""

import pytest
import numpy as np
from python_pipeline.evaluation import evaluate_classifier, evaluate_regressor


def test_classifier_evaluation_metrics():
    y_true = np.array([0, 1, 1, 0, 1, 0, 0, 1])
    y_pred = np.array([0, 1, 1, 0, 0, 0, 0, 1])
    
    metrics = evaluate_classifier(y_true, y_pred)
    assert "accuracy" in metrics
    assert "precision" in metrics
    assert "recall" in metrics
    assert "f1" in metrics
    assert metrics["accuracy"] >= 0.8
    assert "confusion_matrix" in metrics


def test_regressor_evaluation_metrics():
    y_true = np.array([10.0, 20.0, 30.0, 40.0])
    y_pred = np.array([12.0, 19.0, 31.0, 38.0])

    metrics = evaluate_regressor(y_true, y_pred)
    assert "mae" in metrics
    assert "rmse" in metrics
    assert "mape" in metrics
    assert metrics["mae"] < 2.0
    assert metrics["rmse"] < 2.5
