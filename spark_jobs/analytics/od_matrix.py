import logging
from pyspark.sql import functions as F

logger = logging.getLogger(__name__)

def generate_od_matrix(spark, tickets_df):
    """Generates an Origin-Destination matrix from tickets data."""
    od_matrix = tickets_df.groupBy("boarding_stop_id", "alighting_stop_id") \
        .agg(F.count("*").alias("trip_count")) \
        .orderBy(F.desc("trip_count"))
        
    return od_matrix
