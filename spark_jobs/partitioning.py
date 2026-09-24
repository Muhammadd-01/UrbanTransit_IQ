import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def repartition_tables(spark, input_dir="data/features/", output_dir="data/partitioned/"):
    """Repartition large tables based on defined strategy."""
    
    strategies = {
        "tickets": ["year", "month", "route_id"],
        "passenger_counts": ["year", "month"],
        "delays": ["year", "month"],
        "gps_events": ["year", "month", "route_id"]
    }
    
    for table, partitions in strategies.items():
        try:
            df = spark.read.parquet(f"{input_dir}/{table}.parquet")
            output_path = f"{output_dir}/{table}.parquet"
            
            # Repartitioning and writing
            df.write.partitionBy(*partitions).mode("overwrite").parquet(output_path)
            logger.info(f"Successfully partitioned {table} by {partitions} into {output_path}")
        except Exception as e:
            logger.warning(f"Could not repartition {table}: {e}")

def main():
    from .ingestion import create_spark_session
    spark = create_spark_session("UrbanTransit_IQ_Partitioning")
    repartition_tables(spark)
    spark.stop()

if __name__ == "__main__":
    main()
