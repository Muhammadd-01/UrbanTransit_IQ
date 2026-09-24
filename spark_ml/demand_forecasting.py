import logging
from pyspark.sql import SparkSession
from pyspark.ml import Pipeline
from pyspark.ml.regression import LinearRegression, RandomForestRegressor
from pyspark.ml.feature import VectorAssembler, StringIndexer
from spark_ml.model_evaluation import evaluate_regressor
from spark_ml.model_persistence import save_spark_model, save_metrics

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    spark = SparkSession.builder.appName("UrbanTransit_IQ_DemandForecasting").getOrCreate()
    
    try:
        df = spark.read.parquet("data/features/demand.parquet")
        
        indexer = StringIndexer(inputCol="route_id", outputCol="route_index")
        feature_cols = ["route_index", "day_of_week", "month", "historical_demand_7d", "lag_1d"]
        assembler = VectorAssembler(inputCols=feature_cols, outputCol="features")
        
        rf = RandomForestRegressor(featuresCol="features", labelCol="daily_passenger_count")
        
        pipeline = Pipeline(stages=[indexer, assembler, rf])
        
        # Chronological split ideally, using randomSplit for stub
        train, test = df.randomSplit([0.8, 0.2], seed=42)
        model = pipeline.fit(train)
        
        predictions = model.transform(test)
        metrics = evaluate_regressor(predictions, label_col="daily_passenger_count")
        
        logger.info(f"Demand Forecasting Metrics: {metrics}")
        save_spark_model(model, "models/spark/demand_forecasting")
        
    except Exception as e:
        logger.error(f"Error: {e}")
        
    spark.stop()

if __name__ == "__main__":
    main()
