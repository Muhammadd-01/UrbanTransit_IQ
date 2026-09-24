import logging
from pyspark.sql import functions as F
from pyspark.sql.types import StructType, StructField, StringType, TimestampType

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_missing_values(df, table_name):
    """Checks for missing values in all columns."""
    null_counts = df.select([F.sum(F.col(c).isNull().cast("int")).alias(c) for c in df.columns]).collect()[0].asDict()
    return null_counts

def validate_coordinates(df, lat_col="latitude", lon_col="longitude"):
    """Validates if coordinates are within Karachi bounds (lat 24.75-25.10, lon 66.85-67.25)."""
    if lat_col in df.columns and lon_col in df.columns:
        invalid_coords = df.filter(
            (F.col(lat_col) < 24.75) | (F.col(lat_col) > 25.10) |
            (F.col(lon_col) < 66.85) | (F.col(lon_col) > 67.25)
        )
        return invalid_coords.count()
    return 0

def create_audit_trail(spark, issues_list):
    """Creates a DataFrame for the audit trail."""
    schema = StructType([
        StructField("dataset_name", StringType(), True),
        StructField("record_id", StringType(), True),
        StructField("issue_type", StringType(), True),
        StructField("affected_column", StringType(), True),
        StructField("status", StringType(), True)
    ])
    if issues_list:
        return spark.createDataFrame(issues_list, schema)
    return spark.createDataFrame([], schema)

def run_quality_checks(spark, dfs):
    """Runs data quality checks on all DataFrames."""
    summary_report = {}
    audit_issues = []
    
    for table_name, df in dfs.items():
        total_records = df.count()
        missing_vals = check_missing_values(df, table_name)
        total_missing = sum(missing_vals.values())
        invalid_coords = validate_coordinates(df)
        
        # Simple duplicate check
        duplicates = df.count() - df.dropDuplicates().count()
        
        valid_records = total_records - duplicates - invalid_coords
        
        summary_report[table_name] = {
            "total_records": total_records,
            "valid_records": valid_records,
            "missing_values": total_missing,
            "duplicates": duplicates,
            "invalid_coordinates": invalid_coords,
            "completeness_pct": ((total_records - total_missing) / total_records * 100) if total_records > 0 else 0
        }
        logger.info(f"Quality Report for {table_name}: {summary_report[table_name]}")
        
    audit_df = create_audit_trail(spark, audit_issues)
    return summary_report, audit_df

def main():
    from .ingestion import create_spark_session, load_data
    spark = create_spark_session("UrbanTransit_IQ_DataQuality")
    dfs = load_data(spark)
    summary, audit_df = run_quality_checks(spark, dfs)
    
    # Save audit trail
    audit_df.write.mode("overwrite").parquet("data/audit/dq_audit.parquet")
    logger.info("Data quality checks completed and audit saved.")
    spark.stop()

if __name__ == "__main__":
    main()
