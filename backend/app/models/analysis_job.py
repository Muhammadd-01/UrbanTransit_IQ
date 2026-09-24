from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class AnalysisJobModel(BaseModel):
    id: UUID
    dataset_id: UUID
    job_type: str
    status: str
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    duration_seconds: Optional[float]
    records_processed: Optional[int]
    stage: Optional[str]
    error_details: Optional[str]
    logs: Optional[str]
    created_by: UUID
