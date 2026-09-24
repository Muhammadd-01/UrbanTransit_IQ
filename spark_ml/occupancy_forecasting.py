import logging
from pyspark.sql import SparkSession
from pyspark.ml import Pipeline
from pyspark.ml.regression import RandomForestRegressor
from pyspark.ml.feature import VectorAssembler, StringIndexer
from spark_ml.model_evaluation import evaluate_regressor
from spark_ml.model_persistence import save_spark_model

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    spark = SparkSession.builder.appName("UrbanTransit_IQ_OccupancyForecasting").getOrCreate()
    
    try:
        df = spark.read.parquet("data/features/occupancy.parquet")
        
        indexer = StringIndexer(inputCol="route_id", outputCol="route_index")
        feature_cols = ["route_index", "hour", "day_of_week", "historical_occupancy"]
        assembler = VectorAssembler(inputCols=feature_cols, outputCol="features")
        
        rf = RandomForestRegressor(featuresCol="features", labelCol="avg_occupancy_percentage")
        pipeline = Pipeline(stages=[indexer, assembler, rf])
        
        train, test = df.randomSplit([0.8, 0.2], seed=42)
        model = pipeline.fit(train)
        
        predictions = model.transform(test)
        metrics = evaluate_regressor(predictions, label_col="avg_occupancy_percentage")
        
        logger.info(f"Occupancy Forecasting Metrics: {metrics}")
        save_spark_model(model, "models/spark/occupancy_forecasting")
        
    except Exception as e:
        logger.error(f"Error: {e}")
        
    spark.stop()

if __name__ == "__main__":
    main()
