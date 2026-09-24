import logging
from pyspark.sql import functions as F

logger = logging.getLogger(__name__)

def analyze_delays(spark, delays_df):
    """Delay analysis."""
    
    route_delays = delays_df.groupBy("route_id", "delay_cause") \
        .agg(F.avg("delay_minutes").alias("avg_delay"), F.count("*").alias("delay_freq"))
        
    return route_delays
