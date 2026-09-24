import logging
from pyspark.sql import functions as F

logger = logging.getLogger(__name__)

def analyze_vehicle_utilization(spark, trips_df, pc_df):
    """Vehicle utilization analysis."""
    
    daily_trips = trips_df.groupBy("vehicle_id", "date") \
        .agg(F.count("*").alias("trips_per_day"))
        
    return daily_trips
