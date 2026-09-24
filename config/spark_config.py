import logging
from pyspark.sql import SparkSession
from config.settings import settings

logger = logging.getLogger(__name__)

def get_spark_session() -> SparkSession:
    builder = SparkSession.builder.appName(settings.SPARK_APP_NAME)

    if settings.EXECUTION_MODE == 'DEVELOPMENT':
        builder = builder.master('local[*]')
    else:
        builder = builder.master(settings.SPARK_MASTER)

    builder = builder.config("spark.driver.memory", settings.SPARK_DRIVER_MEMORY) \
                     .config("spark.executor.memory", settings.SPARK_EXECUTOR_MEMORY) \
                     .config("spark.sql.parquet.compression.codec", "snappy")

    try:
        return builder.getOrCreate()
    except Exception as e:
        logger.error(f"Failed to create Spark session: {e}")
        raise
