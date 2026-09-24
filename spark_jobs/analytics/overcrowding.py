import logging
from pyspark.sql import functions as F

logger = logging.getLogger(__name__)

def detect_overcrowding(spark, pc_df, routes_df):
    """Detects overcrowded services."""
    
    df = pc_df.join(routes_df, "route_id") \
        .withColumn("occupancy_pct", F.col("current_load") / F.col("vehicle_capacity"))
        
    classified = df.withColumn(
        "occupancy_level",
        F.when(F.col("occupancy_pct") < 0.5, "Low")
         .when(F.col("occupancy_pct") < 0.7, "Moderate")
         .when(F.col("occupancy_pct") < 0.85, "High")
         .when(F.col("occupancy_pct") < 0.95, "Overcrowded")
         .otherwise("Critical")
    )
    
    persistent = classified.filter(F.col("occupancy_level").isin(["Overcrowded", "Critical"])) \
        .groupBy("route_id") \
        .agg(F.count("*").alias("overcrowded_incidents"))
        
    return persistent
