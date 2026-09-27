import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
    confusion_matrix, mean_absolute_error, mean_squared_error, mean_absolute_percentage_error,
    classification_report
)

def evaluate_classifier(y_true, y_pred, y_prob=None):
    """Evaluate a classifier model and return metrics dict."""
    metrics = {
        "accuracy": accuracy_score(y_true, y_pred),
        "precision": precision_score(y_true, y_pred, average="weighted", zero_division=0),
        "recall": recall_score(y_true, y_pred, average="weighted", zero_division=0),
        "f1": f1_score(y_true, y_pred, average="weighted", zero_division=0),
        "confusion_matrix": confusion_matrix(y_true, y_pred).tolist()
    }
    
    # Calculate regression-style error metrics on the binary predictions
    # to match the execution pipeline requirements
    from sklearn.metrics import r2_score
    metrics["mae"] = mean_absolute_error(y_true, y_pred)
    metrics["rmse"] = np.sqrt(mean_squared_error(y_true, y_pred))
    
    def safe_mape(y_t, y_p):
        mask = y_t != 0
        if not np.any(mask): return 0.0
        return np.mean(np.abs((y_t[mask] - y_p[mask]) / y_t[mask])) * 100
        
    metrics["mape"] = safe_mape(np.array(y_true), np.array(y_pred))
    metrics["r2"] = r2_score(y_true, y_pred)
    
    if y_prob is not None:
        try:
            # Handle multi-class vs binary
            if len(y_prob.shape) > 1 and y_prob.shape[1] > 2:
                metrics["roc_auc"] = roc_auc_score(y_true, y_prob, multi_class="ovr")
            else:
                metrics["roc_auc"] = roc_auc_score(y_true, y_prob[:, 1] if len(y_prob.shape) > 1 else y_prob)
        except Exception:
            metrics["roc_auc"] = None
            
    return metrics

def evaluate_regressor(y_true, y_pred):
    """Evaluate a regression model and return metrics dict."""
    from sklearn.metrics import r2_score
    
    def safe_mape(y_t, y_p):
        mask = y_t != 0
        if not np.any(mask): return 0.0
        return np.mean(np.abs((y_t[mask] - y_p[mask]) / y_t[mask])) * 100

    return {
        "mae": mean_absolute_error(y_true, y_pred),
        "rmse": np.sqrt(mean_squared_error(y_true, y_pred)),
        "mape": safe_mape(np.array(y_true), np.array(y_pred)),
        "r2": r2_score(y_true, y_pred)
    }

def get_feature_importance(model, feature_names):
    """Extract and sort feature importance from model."""
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
    elif hasattr(model, 'coef_'):
        importances = np.abs(model.coef_[0]) if len(model.coef_.shape) > 1 else np.abs(model.coef_)
    else:
        return []
        
    feature_imp = list(zip(feature_names, importances))
    feature_imp.sort(key=lambda x: x[1], reverse=True)
    return feature_imp

def format_classification_report(y_true, y_pred):
    """Format scikit-learn classification report as string."""
    return classification_report(y_true, y_pred, zero_division=0)

def plot_confusion_matrix(y_true, y_pred, labels):
    """Placeholder for plotly confusion matrix."""
    pass

def plot_roc_curve(y_true, y_prob):
    """Placeholder for plotly ROC curve."""
    pass
