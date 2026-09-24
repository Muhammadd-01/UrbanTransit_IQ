import logging
from pyspark.sql import functions as F

logger = logging.getLogger(__name__)

def evaluate_route_performance(spark, routes_df, trips_df, tickets_df, delays_df, pc_df):
    """Calculates composite route performance."""
    
    total_trips = trips_df.groupBy("route_id").agg(F.countDistinct("trip_id").alias("total_trips"))
    on_time = delays_df.filter(F.col("delay_minutes") <= 2).groupBy("route_id").agg(F.countDistinct("trip_id").alias("on_time_trips"))
    
    perf = routes_df.join(total_trips, "route_id", "left").join(on_time, "route_id", "left") \
        .withColumn("punctuality_score", F.coalesce(F.col("on_time_trips") / F.col("total_trips") * 100, F.lit(0)))
        
    return perf
