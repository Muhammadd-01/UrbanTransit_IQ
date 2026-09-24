import logging
from pyspark.sql import SparkSession
from pyspark.ml.clustering import KMeans
from pyspark.ml.feature import VectorAssembler, StandardScaler
from spark_ml.model_persistence import save_spark_model

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    spark = SparkSession.builder.appName("UrbanTransit_IQ_PassengerSegmentation").getOrCreate()
    
    try:
        df = spark.read.parquet("data/features/passengers_agg.parquet")
        
        feature_cols = ["trip_frequency", "peak_usage_ratio", "route_diversity", "avg_trip_distance"]
        assembler = VectorAssembler(inputCols=feature_cols, outputCol="features")
        scaler = StandardScaler(inputCol="features", outputCol="scaledFeatures")
        
        kmeans = KMeans(featuresCol="scaledFeatures", k=4)
        model = kmeans.fit(scaler.fit(assembler.transform(df)))
        
        save_spark_model(model, "models/spark/passenger_segmentation")
        
    except Exception as e:
        logger.error(f"Error: {e}")
        
    spark.stop()

if __name__ == "__main__":
    main()
