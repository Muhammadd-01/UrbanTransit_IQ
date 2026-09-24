import logging
from pyspark.sql import functions as F
from pyspark.sql.window import Window

logger = logging.getLogger(__name__)

def analyze_headway(spark, trips_df):
    """Calculates headway between consecutive vehicles."""
    
    window_spec = Window.partitionBy("route_id", "direction").orderBy("actual_departure")
    
    df = trips_df.withColumn("prev_departure", F.lag("actual_departure").over(window_spec)) \
        .withColumn("headway_minutes", (F.unix_timestamp("actual_departure") - F.unix_timestamp("prev_departure")) / 60)
        
    return df
