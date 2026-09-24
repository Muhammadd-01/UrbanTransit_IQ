import logging
from pyspark.sql import functions as F

logger = logging.getLogger(__name__)

def detect_bunching(spark, headway_df):
    """Detects vehicle bunching."""
    
    bunching = headway_df.filter(F.col("headway_minutes") < 5) # Example threshold
    return bunching
