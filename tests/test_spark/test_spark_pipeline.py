"""
Tests for Spark schemas, partition strategies, and SQL query definitions.
"""

import os
from pathlib import Path


def test_spark_sql_files_exist():
    spark_sql_dir = Path("spark_sql")
    assert spark_sql_dir.exists()
    
    expected_queries = [
        "delay_queries.sql",
        "occupancy_queries.sql",
        "od_queries.sql",
        "passenger_flow_queries.sql",
        "peak_detection_queries.sql",
        "route_performance_queries.sql",
        "vehicle_queries.sql",
    ]
    for q in expected_queries:
        q_file = spark_sql_dir / q
        assert q_file.exists(), f"Missing SQL file: {q}"
        content = q_file.read_text()
        assert len(content) > 20, f"SQL file {q} appears empty!"
        assert "SELECT" in content.upper(), f"SQL file {q} must contain SELECT statement"


def test_partitioning_script_configuration():
    partitioning_file = Path("spark_jobs/partitioning.py")
    assert partitioning_file.exists()
    content = partitioning_file.read_text()
    assert "partitionBy" in content or "repartition" in content
    assert "year" in content.lower()
    assert "month" in content.lower()
