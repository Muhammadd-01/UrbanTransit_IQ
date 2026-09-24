"""
Spark job monitoring service tracking lifecycle, duration, stages, and records processed.
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
from backend.app.database.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

_SPARK_JOBS: List[Dict[str, Any]] = [
    {
        "id": "job-spark-ingestion-01",
        "job_name": "PySpark_Raw_Ingestion",
        "status": "success",
        "start_time": datetime.utcnow().isoformat(),
        "end_time": datetime.utcnow().isoformat(),
        "duration_seconds": 14.1,
        "records_processed": 2000000,
        "stage": "Completed",
        "error_details": None,
        "log_path": "logs/spark_ingestion.log",
    },
    {
        "id": "job-spark-quality-01",
        "job_name": "Spark_Data_Quality_Audit",
        "status": "success",
        "start_time": datetime.utcnow().isoformat(),
        "end_time": datetime.utcnow().isoformat(),
        "duration_seconds": 22.4,
        "records_processed": 2000000,
        "stage": "Completed",
        "error_details": None,
        "log_path": "logs/spark_quality.log",
    }
]


def list_spark_jobs() -> List[Dict[str, Any]]:
    client = get_supabase_client()
    if client:
        try:
            res = client.table("spark_job_monitor").select("*").order("start_time", desc=True).execute()
            if res.data and len(res.data) > 0:
                return res.data
        except Exception as e:
            logger.warning(f"Failed to fetch Spark jobs from Supabase: {e}")
    return _SPARK_JOBS


def create_job(job_name: str) -> Dict[str, Any]:
    job_id = str(uuid.uuid4())
    record = {
        "id": job_id,
        "job_name": job_name,
        "status": "running",
        "start_time": datetime.utcnow().isoformat(),
        "end_time": None,
        "duration_seconds": None,
        "records_processed": 0,
        "stage": "Initializing",
        "error_details": None,
        "log_path": f"logs/{job_name}.log",
    }
    _SPARK_JOBS.append(record)
    return record


def complete_job(job_id: str, records_processed: int, duration_seconds: float) -> Optional[Dict[str, Any]]:
    for job in _SPARK_JOBS:
        if job["id"] == job_id:
            job["status"] = "success"
            job["end_time"] = datetime.utcnow().isoformat()
            job["duration_seconds"] = duration_seconds
            job["records_processed"] = records_processed
            job["stage"] = "Completed"
            return job
    return None
