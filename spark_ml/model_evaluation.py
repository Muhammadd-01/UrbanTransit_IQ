import json
from pyspark.ml.evaluation import BinaryClassificationEvaluator, MulticlassClassificationEvaluator, RegressionEvaluator

def evaluate_binary_classifier(predictions_df, label_col="label", prediction_col="prediction", raw_prediction_col="rawPrediction"):
    """Evaluates a binary classification model and returns a dictionary of metrics."""
    # Binary evaluators
    evaluator_auc = BinaryClassificationEvaluator(labelCol=label_col, rawPredictionCol=raw_prediction_col, metricName="areaUnderROC")
    
    # Multiclass evaluators for accuracy, precision, recall, f1
    evaluator_multi = MulticlassClassificationEvaluator(labelCol=label_col, predictionCol=prediction_col)
    
    metrics = {
        "accuracy": evaluator_multi.evaluate(predictions_df, {evaluator_multi.metricName: "accuracy"}),
        "precision": evaluator_multi.evaluate(predictions_df, {evaluator_multi.metricName: "weightedPrecision"}),
        "recall": evaluator_multi.evaluate(predictions_df, {evaluator_multi.metricName: "weightedRecall"}),
        "f1": evaluator_multi.evaluate(predictions_df, {evaluator_multi.metricName: "f1"}),
        "roc_auc": evaluator_auc.evaluate(predictions_df)
    }
    return metrics

def evaluate_multiclass_classifier(predictions_df, label_col="label", prediction_col="prediction"):
    """Evaluates a multiclass classification model."""
    evaluator = MulticlassClassificationEvaluator(labelCol=label_col, predictionCol=prediction_col)
    metrics = {
        "accuracy": evaluator.evaluate(predictions_df, {evaluator.metricName: "accuracy"}),
        "precision": evaluator.evaluate(predictions_df, {evaluator.metricName: "weightedPrecision"}),
        "recall": evaluator.evaluate(predictions_df, {evaluator.metricName: "weightedRecall"}),
        "f1": evaluator.evaluate(predictions_df, {evaluator.metricName: "f1"})
    }
    return metrics

def evaluate_regressor(predictions_df, label_col="label", prediction_col="prediction"):
    """Evaluates a regression model."""
    evaluator = RegressionEvaluator(labelCol=label_col, predictionCol=prediction_col)
    metrics = {
        "rmse": evaluator.evaluate(predictions_df, {evaluator.metricName: "rmse"}),
        "mae": evaluator.evaluate(predictions_df, {evaluator.metricName: "mae"}),
        "r2": evaluator.evaluate(predictions_df, {evaluator.metricName: "r2"})
    }
    return metrics

def get_feature_importance(model, feature_names):
    """Returns a sorted list of feature importances from a tree-based model."""
    if hasattr(model, "featureImportances"):
        importances = model.featureImportances.toArray()
        features_with_scores = list(zip(feature_names, importances))
        features_with_scores.sort(key=lambda x: x[1], reverse=True)
        return features_with_scores
    return []

def generate_confusion_matrix(predictions_df, label_col="label", prediction_col="prediction"):
    """Generates a confusion matrix."""
    conf_matrix = predictions_df.crosstab(label_col, prediction_col)
    return conf_matrix.collect()

def format_metrics_report(metrics_dict):
    """Formats a metrics dictionary into a readable report."""
    report = "Model Evaluation Metrics:\n"
    report += "-" * 30 + "\n"
    for metric, value in metrics_dict.items():
        if isinstance(value, float):
            report += f"{metric.upper():<15}: {value:.4f}\n"
        else:
            report += f"{metric.upper():<15}: {value}\n"
    return report
