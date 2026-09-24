import os
from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, StringType, IntegerType, FloatType, DoubleType, TimestampType, DateType
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_spark_session(app_name="UrbanTransit_IQ_Ingestion"):
    """Creates a SparkSession."""
    return SparkSession.builder \
        .appName(app_name) \
        .getOrCreate()

def get_schemas():
    """Defines explicit schemas for all CSV files."""
    return {
        "routes": StructType([
            StructField("route_id", StringType(), True),
            StructField("route_name", StringType(), True),
            StructField("route_type", StringType(), True),
            StructField("total_distance_km", FloatType(), True),
            StructField("num_stops", IntegerType(), True),
            StructField("vehicle_capacity", IntegerType(), True)
        ]),
        "stops": StructType([
            StructField("stop_id", StringType(), True),
            StructField("stop_name", StringType(), True),
            StructField("latitude", DoubleType(), True),
            StructField("longitude", DoubleType(), True)
        ]),
        "route_stops": StructType([
            StructField("route_id", StringType(), True),
            StructField("stop_id", StringType(), True),
            StructField("stop_sequence", IntegerType(), True),
            StructField("distance_from_previous", FloatType(), True)
        ]),
        "vehicles": StructType([
            StructField("vehicle_id", StringType(), True),
            StructField("vehicle_type", StringType(), True),
            StructField("capacity", IntegerType(), True),
            StructField("year_of_manufacture", IntegerType(), True)
        ]),
        "service_calendar": StructType([
            StructField("date", DateType(), True),
            StructField("day_of_week", IntegerType(), True),
            StructField("is_weekend", IntegerType(), True),
            StructField("is_holiday", IntegerType(), True)
        ]),
        "schedules": StructType([
            StructField("schedule_id", StringType(), True),
            StructField("route_id", StringType(), True),
            StructField("direction", StringType(), True),
            StructField("departure_time", TimestampType(), True),
            StructField("arrival_time", TimestampType(), True)
        ]),
        "trips": StructType([
            StructField("trip_id", StringType(), True),
            StructField("route_id", StringType(), True),
            StructField("vehicle_id", StringType(), True),
            StructField("date", DateType(), True),
            StructField("direction", StringType(), True),
            StructField("actual_departure", TimestampType(), True),
            StructField("actual_arrival", TimestampType(), True),
            StructField("status", StringType(), True)
        ]),
        "passengers": StructType([
            StructField("passenger_id", StringType(), True),
            StructField("passenger_type", StringType(), True),
            StructField("registration_date", DateType(), True)
        ]),
        "tickets": StructType([
            StructField("ticket_id", StringType(), True),
            StructField("passenger_id", StringType(), True),
            StructField("trip_id", StringType(), True),
            StructField("boarding_stop_id", StringType(), True),
            StructField("alighting_stop_id", StringType(), True),
            StructField("boarding_time", TimestampType(), True),
            StructField("fare", FloatType(), True)
        ]),
        "passenger_counts": StructType([
            StructField("count_id", StringType(), True),
            StructField("trip_id", StringType(), True),
            StructField("stop_id", StringType(), True),
            StructField("timestamp", TimestampType(), True),
            StructField("boarding_count", IntegerType(), True),
            StructField("alighting_count", IntegerType(), True),
            StructField("current_load", IntegerType(), True)
        ]),
        "delays": StructType([
            StructField("delay_id", StringType(), True),
            StructField("trip_id", StringType(), True),
            StructField("route_id", StringType(), True),
            StructField("stop_id", StringType(), True),
            StructField("scheduled_time", TimestampType(), True),
            StructField("actual_time", TimestampType(), True),
            StructField("delay_minutes", FloatType(), True),
            StructField("delay_cause", StringType(), True)
        ]),
        "gps_events": StructType([
            StructField("event_id", StringType(), True),
            StructField("vehicle_id", StringType(), True),
            StructField("route_id", StringType(), True),
            StructField("timestamp", TimestampType(), True),
            StructField("latitude", DoubleType(), True),
            StructField("longitude", DoubleType(), True),
            StructField("speed_kmh", FloatType(), True)
        ])
    }

def load_data(spark, data_dir="data/raw"):
    """Reads all raw CSV files into DataFrames."""
    schemas = get_schemas()
    dataframes = {}
    
    for table_name, schema in schemas.items():
        file_path = os.path.join(data_dir, f"{table_name}.csv")
        try:
            df = spark.read.csv(file_path, schema=schema, header=True, 
                              mode="PERMISSIVE", columnNameOfCorruptRecord="_corrupt_record")
            
            # Register temp view for Spark SQL
            df.createOrReplaceTempView(table_name)
            dataframes[table_name] = df
            
            count = df.count()
            logger.info(f"Loaded {table_name}: {count} records")
        except Exception as e:
            logger.warning(f"Could not load {table_name} from {file_path}. Error: {e}")
            
    return dataframes

def main():
    spark = create_spark_session()
    logger.info("Starting Data Ingestion...")
    dfs = load_data(spark)
    logger.info("Data Ingestion completed.")
    spark.stop()

if __name__ == "__main__":
    main()
