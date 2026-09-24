from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class SparkJobModel(BaseModel):
    id: UUID
    job_name: str
    status: str
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    duration_seconds: Optional[float]
    records_processed: Optional[int]
    stage: Optional[str]
    error_details: Optional[str]
    log_path: Optional[str]
