import logging
from pyspark.sql import SparkSession
from pyspark.ml.clustering import KMeans
from pyspark.ml.evaluation import ClusteringEvaluator
from pyspark.ml.feature import VectorAssembler, StandardScaler
from spark_ml.model_persistence import save_spark_model

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    spark = SparkSession.builder.appName("UrbanTransit_IQ_RouteClustering").getOrCreate()
    
    try:
        # Assuming aggregated route features are available
        df = spark.read.parquet("data/features/routes_agg.parquet")
        
        feature_cols = ["avg_demand", "avg_occupancy", "avg_delay", "reliability_score"]
        assembler = VectorAssembler(inputCols=feature_cols, outputCol="features")
        scaler = StandardScaler(inputCol="features", outputCol="scaledFeatures")
        
        # Select best k
        best_k = 3
        best_silhouette = -1
        
        # Simplified process
        kmeans = KMeans(featuresCol="scaledFeatures", k=best_k)
        model = kmeans.fit(scaler.fit(assembler.transform(df)))
        
        save_spark_model(model, "models/spark/route_clustering")
        
    except Exception as e:
        logger.error(f"Error: {e}")
        
    spark.stop()

if __name__ == "__main__":
    main()
