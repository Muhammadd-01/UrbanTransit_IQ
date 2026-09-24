# UrbanTransit IQ — Apache Spark Pipeline Manual
Details Pipeline A using Apache Spark, PySpark, Spark SQL, and Spark MLlib.
- Ingestion with explicit schemas (`spark_jobs/ingestion.py`)
- Distributed cleaning and imputation (`spark_jobs/cleaning.py`)
- Feature engineering (`spark_jobs/feature_engineering.py`)
- Columnar Parquet partitioning by `(year, month)` (`spark_jobs/partitioning.py`)
- Spark MLlib model training (Logistic Regression, Random Forest, GBT) (`spark_ml/`)
