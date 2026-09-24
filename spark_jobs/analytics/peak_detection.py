import logging
from pyspark.sql import functions as F
from pyspark.sql.window import Window

logger = logging.getLogger(__name__)

def detect_peaks(spark, tickets_df, trips_df):
    """Detects peak hours based on statistical methods (Z-score)."""
    
    hourly_vol = tickets_df.join(trips_df, "trip_id") \
        .withColumn("hour", F.hour("boarding_time")) \
        .groupBy("route_id", "date", "hour") \
        .agg(F.count("*").alias("passenger_count"))
        
    window_spec = Window.partitionBy("route_id")
    
    stats_df = hourly_vol.withColumn("mean_vol", F.avg("passenger_count").over(window_spec)) \
        .withColumn("std_vol", F.stddev("passenger_count").over(window_spec))
        
    peaks_df = stats_df.withColumn(
        "is_peak",
        F.when(F.col("passenger_count") > (F.col("mean_vol") + 1.5 * F.col("std_vol")), True).otherwise(False)
    )
    
    return peaks_df.filter(F.col("is_peak") == True)
