"""
Spark job monitoring service tracking lifecycle, duration, stages, and records processed.
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
from backend.app.database.engine import SessionLocal
from backend.app.database.models import SparkJobMonitor

logger = logging.getLogger(__name__)

_SPARK_JOBS: List[Dict[str, Any]] = []

def _job_to_dict(job: SparkJobMonitor) -> Dict[str, Any]:
    return {
        "id": str(job.id),
        "job_name": job.job_name,
        "status": job.status,
        "start_time": job.start_time.isoformat() if job.start_time else None,
        "end_time": job.end_time.isoformat() if job.end_time else None,
        "duration_seconds": job.duration_seconds,
        "records_processed": job.records_processed,
        "stage": job.stage,
        "error_details": job.error_details,
        "log_path": job.log_path,
    }

def list_spark_jobs() -> List[Dict[str, Any]]:
    try:
        with SessionLocal() as db:
            jobs = db.query(SparkJobMonitor).order_by(SparkJobMonitor.start_time.desc()).all()
            if jobs:
                return [_job_to_dict(job) for job in jobs]
    except Exception as e:
        logger.warning(f"Failed to fetch Spark jobs from PostgreSQL: {e}")
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
    
    try:
        with SessionLocal() as db:
            new_job = SparkJobMonitor(
                id=job_id,
                job_name=job_name,
                status="running",
                start_time=datetime.utcnow(),
                records_processed=0,
                stage="Initializing",
                log_path=record["log_path"]
            )
            db.add(new_job)
            db.commit()
    except Exception as e:
        logger.warning(f"Could not insert spark job in PostgreSQL: {e}")

    _SPARK_JOBS.append(record)
    return record


def complete_job(job_id: str, records_processed: int, duration_seconds: float) -> Optional[Dict[str, Any]]:
    # Update in DB
    try:
        with SessionLocal() as db:
            job = db.query(SparkJobMonitor).filter(SparkJobMonitor.id == job_id).first()
            if job:
                job.status = "success"
                job.end_time = datetime.utcnow()
                job.duration_seconds = duration_seconds
                job.records_processed = records_processed
                job.stage = "Completed"
                db.commit()
                db.refresh(job)
                return _job_to_dict(job)
    except Exception as e:
        logger.warning(f"Could not update spark job in PostgreSQL: {e}")

    # Fallback to memory
    for job in _SPARK_JOBS:
        if job["id"] == job_id:
            job["status"] = "success"
            job["end_time"] = datetime.utcnow().isoformat()
            job["duration_seconds"] = duration_seconds
            job["records_processed"] = records_processed
            job["stage"] = "Completed"
            return job
    return None
