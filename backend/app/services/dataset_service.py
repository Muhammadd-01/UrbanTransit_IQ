"""
Dataset management service orchestrating generation, listing, and HDFS uploads.
"""

import os
import glob
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
from backend.app.database.engine import SessionLocal
from backend.app.database.models import Dataset
from data_generator.generate_data import main as run_generator

logger = logging.getLogger(__name__)

_IN_MEMORY_DATASETS: List[Dict[str, Any]] = [
    {
        "id": "ds-karachi-sample-01",
        "name": "Karachi Transit Baseline",
        "scale": "small",
        "status": "ready",
        "record_count": 52400,
        "file_path": "data/raw",
        "created_at": datetime.utcnow().isoformat(),
    }
]

def _dataset_to_dict(ds: Dataset) -> Dict[str, Any]:
    return {
        "id": str(ds.id),
        "name": ds.name,
        "scale": ds.scale,
        "status": ds.status,
        "record_count": ds.record_count,
        "file_path": ds.file_path,
        "created_by": str(ds.created_by) if ds.created_by else None,
        "created_at": ds.created_at.isoformat() if ds.created_at else None,
    }

def list_datasets() -> List[Dict[str, Any]]:
    try:
        with SessionLocal() as db:
            datasets = db.query(Dataset).order_by(Dataset.created_at.desc()).all()
            if datasets:
                return [_dataset_to_dict(ds) for ds in datasets]
    except Exception as e:
        logger.warning(f"Failed to query datasets from PostgreSQL: {e}")

    # Inspect data/raw folder for files
    raw_files = glob.glob("data/raw/*.csv")
    total_size = sum(os.path.getsize(f) for f in raw_files) if raw_files else 0
    if raw_files:
        _IN_MEMORY_DATASETS[0]["record_count"] = len(raw_files) * 5000
        _IN_MEMORY_DATASETS[0]["status"] = "ready"
    return _IN_MEMORY_DATASETS


def generate_dataset(scale: str = "small", created_by: Optional[str] = None) -> Dict[str, Any]:
    """Generates synthetic dataset and tracks record in database."""
    dataset_id = str(uuid.uuid4())
    logger.info(f"Triggering data generation with scale={scale}")
    try:
        import subprocess
        logger.info(f"Triggering dynamic MongoDB data generation...")
        res = subprocess.run(["./venv/bin/python", "scripts/generate_exact_3m_mongo.py"], capture_output=True, text=True)
        if res.returncode != 0:
            raise Exception(res.stderr)
        status = "ready"

    except Exception as e:
        logger.error(f"Data generation failed: {e}")
        status = "failed"

    record = {
        "id": dataset_id,
        "name": f"Karachi Transit Network ({scale.capitalize()})",
        "scale": scale,
        "status": status,
        "record_count": 2000000 if scale == "competition" else (500000 if scale == "medium" else 50000),
        "file_path": "data/raw",
        "created_by": created_by,
        "created_at": datetime.utcnow().isoformat(),
    }

    try:
        with SessionLocal() as db:
            new_ds = Dataset(
                id=dataset_id,
                name=record["name"],
                scale=record["scale"],
                status=record["status"],
                record_count=record["record_count"],
                file_path=record["file_path"],
                created_by=record["created_by"],
            )
            db.add(new_ds)
            db.commit()
    except Exception as e:
        logger.warning(f"Could not record dataset in PostgreSQL: {e}")

    _IN_MEMORY_DATASETS.append(record)
    return record


def upload_dataset_to_hdfs(dataset_id: str) -> Dict[str, Any]:
    """Triggers HDFS upload script."""
    logger.info(f"Uploading dataset {dataset_id} to HDFS...")
    script_path = "hadoop/hdfs_scripts/upload_to_hdfs.sh"
    if os.path.exists(script_path):
        import subprocess
        res = subprocess.run(["bash", script_path], capture_output=True, text=True)
        return {
            "status": "success" if res.returncode == 0 else "failed",
            "output": res.stdout,
            "error": res.stderr
        }
    return {"status": "mock_success", "message": "HDFS upload simulated in development mode."}
