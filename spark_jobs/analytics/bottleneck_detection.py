import logging
from pyspark.sql import functions as F

logger = logging.getLogger(__name__)

def detect_bottlenecks(spark, delays_df, stops_df):
    """Bottleneck detection."""
    
    stop_delays = delays_df.groupBy("stop_id") \
        .agg(F.avg("delay_minutes").alias("avg_delay"), F.count("*").alias("delay_freq")) \
        .filter(F.col("delay_freq") > 10)
        
    bottlenecks = stop_delays.join(stops_df, "stop_id") \
        .orderBy(F.desc("avg_delay"))
        
    return bottlenecks
