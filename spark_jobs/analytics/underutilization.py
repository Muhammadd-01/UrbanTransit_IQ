import logging
from pyspark.sql import functions as F

logger = logging.getLogger(__name__)

def detect_underutilization(spark, pc_df, routes_df):
    """Detects underutilized services."""
    
    df = pc_df.join(routes_df, "route_id") \
        .withColumn("occupancy_pct", F.col("current_load") / F.col("vehicle_capacity"))
        
    avg_occ = df.groupBy("route_id", "trip_id") \
        .agg(F.avg("occupancy_pct").alias("avg_occupancy"))
        
    underutilized = avg_occ.filter(F.col("avg_occupancy") < 0.25)
    return underutilized
