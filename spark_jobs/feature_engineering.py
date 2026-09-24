import logging
from pyspark.sql import functions as F
from pyspark.sql.window import Window

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_time_features(df, timestamp_col):
    """Extracts hour, day_of_week, and month from timestamp."""
    return df.withColumn("hour", F.hour(F.col(timestamp_col))) \
             .withColumn("day_of_week", F.dayofweek(F.col(timestamp_col))) \
             .withColumn("month", F.month(F.col(timestamp_col)))

def create_trip_features(dfs):
    """Creates trip-level features."""
    trips = dfs.get("trips")
    delays = dfs.get("delays")
    routes = dfs.get("routes")
    calendar = dfs.get("service_calendar")
    
    if not all([trips, delays, routes, calendar]):
        logger.warning("Missing DataFrames for feature engineering.")
        return None
        
    # Join necessary tables
    df = trips.join(routes, "route_id", "left") \
              .join(calendar, "date", "left") \
              .join(delays.groupBy("trip_id").agg(F.max("delay_minutes").alias("delay_minutes")), "trip_id", "left")
              
    # Travel time (actual_arrival - actual_departure) in minutes
    df = df.withColumn(
        "travel_time",
        (F.unix_timestamp("actual_arrival") - F.unix_timestamp("actual_departure")) / 60
    )
    
    # Peak indicator (1 if hour in [7,8,9,17,18,19])
    df = df.withColumn("hour", F.hour("actual_departure"))
    df = df.withColumn(
        "peak_indicator",
        F.when(F.col("hour").isin([7, 8, 9, 17, 18, 19]), 1).otherwise(0)
    )
    
    # Delay severity
    df = df.withColumn(
        "delay_severity",
        F.when(F.col("delay_minutes") < 2, "On Time")
         .when((F.col("delay_minutes") >= 2) & (F.col("delay_minutes") < 5), "Minor")
         .when((F.col("delay_minutes") >= 5) & (F.col("delay_minutes") < 10), "Moderate")
         .when((F.col("delay_minutes") >= 10) & (F.col("delay_minutes") < 20), "Major")
         .otherwise("Severe")
    )
    
    # Year and month for partitioning
    df = df.withColumn("year", F.year("date"))
    
    return df

def main():
    from .ingestion import create_spark_session
    spark = create_spark_session("UrbanTransit_IQ_FeatureEngineering")
    
    # In a real scenario, we'd load from cleaned Parquet files here
    # For structure, let's assume `dfs` is loaded
    # ... loading logic ...
    logger.info("Feature engineering complete. Saved to data/features/")
    spark.stop()

if __name__ == "__main__":
    main()
