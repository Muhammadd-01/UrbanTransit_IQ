import logging
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.ml import Pipeline
from pyspark.ml.feature import StringIndexer, VectorAssembler
from pyspark.ml.classification import RandomForestClassifier
from spark_ml.model_evaluation import evaluate_multiclass_classifier
from spark_ml.model_persistence import save_spark_model, save_metrics

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    spark = SparkSession.builder.appName("UrbanTransit_IQ_DelaySeverity").getOrCreate()
    
    try:
        df = spark.read.parquet("data/features/trips.parquet")
        
        # Target: severity_class
        severity_indexer = StringIndexer(inputCol="delay_severity", outputCol="label")
        route_indexer = StringIndexer(inputCol="route_id", outputCol="route_index")
        
        feature_cols = ["route_index", "hour", "day_of_week"]
        assembler = VectorAssembler(inputCols=feature_cols, outputCol="features")
        
        rf = RandomForestClassifier(featuresCol="features", labelCol="label", numTrees=100)
        pipeline = Pipeline(stages=[severity_indexer, route_indexer, assembler, rf])
        
        train, test = df.randomSplit([0.8, 0.2], seed=42)
        model = pipeline.fit(train)
        
        predictions = model.transform(test)
        metrics = evaluate_multiclass_classifier(predictions)
        
        logger.info(f"Metrics: {metrics}")
        
        save_spark_model(model, "models/spark/delay_severity")
        save_metrics(metrics, "models/spark/delay_severity_metrics.json")
        
    except Exception as e:
        logger.error(f"Error: {e}")
        
    spark.stop()

if __name__ == "__main__":
    main()
