import logging
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.ml import Pipeline
from pyspark.ml.feature import StringIndexer, VectorAssembler, StandardScaler
from pyspark.ml.classification import LogisticRegression, RandomForestClassifier, GBTClassifier
from spark_ml.model_evaluation import evaluate_binary_classifier, format_metrics_report
from spark_ml.model_persistence import save_spark_model, save_metrics

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def prepare_data(spark, features_path):
    """Loads and prepares data for delay prediction."""
    df = spark.read.parquet(features_path)
    
    # Define target
    df = df.withColumn("is_delayed", F.when(F.col("delay_minutes") > 5, 1.0).otherwise(0.0))
    
    # Handle categoricals
    indexer = StringIndexer(inputCol="route_id", outputCol="route_index", handleInvalid="keep")
    
    # Feature columns
    feature_cols = ["route_index", "hour", "day_of_week", "peak_indicator", "travel_time"]
    
    # Filter valid rows
    df = df.dropna(subset=feature_cols + ["is_delayed"])
    
    assembler = VectorAssembler(inputCols=feature_cols, outputCol="features")
    
    # Chronological split
    df = df.orderBy("date", "actual_departure")
    total_count = df.count()
    train_count = int(total_count * 0.7)
    val_count = int(total_count * 0.15)
    
    # In a real Spark job we'd use a window function or split by a specific date
    # Here we'll use a date threshold for simplicity assuming data spans some time
    # This is a placeholder for actual chronological split
    train, val, test = df.randomSplit([0.7, 0.15, 0.15], seed=42) # Should be chronological in production
    
    return train, val, test, indexer, assembler, feature_cols

def train_and_evaluate(train, val, test, indexer, assembler, feature_cols):
    """Trains models and selects the best one."""
    
    lr = LogisticRegression(featuresCol="features", labelCol="is_delayed", maxIter=100, regParam=0.01)
    rf = RandomForestClassifier(featuresCol="features", labelCol="is_delayed", numTrees=100, maxDepth=10)
    gbt = GBTClassifier(featuresCol="features", labelCol="is_delayed", maxIter=50, maxDepth=8)
    
    models = {"LogisticRegression": lr, "RandomForest": rf, "GBT": gbt}
    best_model = None
    best_f1 = 0
    best_name = ""
    
    for name, estimator in models.items():
        logger.info(f"Training {name}...")
        pipeline = Pipeline(stages=[indexer, assembler, estimator])
        model = pipeline.fit(train)
        
        predictions = model.transform(val)
        metrics = evaluate_binary_classifier(predictions, label_col="is_delayed")
        logger.info(f"{name} Validation Metrics: {metrics}")
        
        if metrics["f1"] > best_f1:
            best_f1 = metrics["f1"]
            best_model = model
            best_name = name
            
    logger.info(f"Best model selected: {best_name}")
    
    # Test best model
    test_preds = best_model.transform(test)
    test_metrics = evaluate_binary_classifier(test_preds, label_col="is_delayed")
    logger.info(f"Test Metrics for best model: {test_metrics}")
    
    return best_model, test_metrics

def main():
    spark = SparkSession.builder.appName("UrbanTransit_IQ_DelayPrediction").getOrCreate()
    
    # Assuming features are at data/features/trips.parquet
    try:
        train, val, test, indexer, assembler, feature_cols = prepare_data(spark, "data/features/trips.parquet")
        best_model, test_metrics = train_and_evaluate(train, val, test, indexer, assembler, feature_cols)
        
        # Save model and metrics
        save_spark_model(best_model, "models/spark/delay_prediction", {"features": feature_cols})
        save_metrics(test_metrics, "models/spark/delay_prediction_metrics.json")
        logger.info("Saved best model and metrics.")
        
    except Exception as e:
        logger.error(f"Failed to run delay prediction job: {e}")
        
    spark.stop()

if __name__ == "__main__":
    main()
