import logging
from pyspark.sql import functions as F

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def clean_dataframes(dfs):
    """Applies cleaning rules to the DataFrames."""
    cleaned_dfs = {}
    
    for name, df in dfs.items():
        logger.info(f"Cleaning {name}...")
        # Drop exact duplicates
        clean_df = df.dropDuplicates()
        
        if name == "delays":
            # Cap delays at 120 minutes
            clean_df = clean_df.withColumn(
                "delay_minutes",
                F.when(F.col("delay_minutes") > 120, 120).otherwise(F.col("delay_minutes"))
            )
            
        if name == "passenger_counts":
            # Fix negative counts
            clean_df = clean_df.withColumn(
                "boarding_count", F.when(F.col("boarding_count") < 0, 0).otherwise(F.col("boarding_count"))
            ).withColumn(
                "alighting_count", F.when(F.col("alighting_count") < 0, 0).otherwise(F.col("alighting_count"))
            ).withColumn(
                "current_load", F.when(F.col("current_load") < 0, 0).otherwise(F.col("current_load"))
            )
            
        if name in ["stops", "gps_events"]:
            # Drop invalid coordinates (basic cleanup)
            clean_df = clean_df.filter(
                (F.col("latitude") >= 24.75) & (F.col("latitude") <= 25.10) &
                (F.col("longitude") >= 66.85) & (F.col("longitude") <= 67.25)
            )
            
        # Fill missing categorical values
        for col_name, col_type in df.dtypes:
            if col_type == "string":
                clean_df = clean_df.fillna("UNKNOWN", subset=[col_name])
                
        cleaned_dfs[name] = clean_df
        
    return cleaned_dfs

def main():
    from .ingestion import create_spark_session, load_data
    spark = create_spark_session("UrbanTransit_IQ_Cleaning")
    dfs = load_data(spark)
    
    cleaned_dfs = clean_dataframes(dfs)
    
    # Save cleaned DataFrames
    for name, df in cleaned_dfs.items():
        output_path = f"data/cleaned/{name}.parquet"
        df.write.mode("overwrite").parquet(output_path)
        logger.info(f"Saved cleaned {name} to {output_path}")
        
    spark.stop()

if __name__ == "__main__":
    main()
