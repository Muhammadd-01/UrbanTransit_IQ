import logging
from pyspark.sql import functions as F
from pyspark.sql.window import Window

logger = logging.getLogger(__name__)

def calculate_passenger_flow(spark, tickets_df, trips_df):
    """Aggregate boarding/alighting by stop, route, hour, day."""
    
    flow_df = tickets_df.join(trips_df, "trip_id") \
        .withColumn("hour", F.hour("boarding_time")) \
        .groupBy("route_id", "direction", "boarding_stop_id", "hour", "date") \
        .agg(F.count("*").alias("boardings"))
        
    return flow_df
