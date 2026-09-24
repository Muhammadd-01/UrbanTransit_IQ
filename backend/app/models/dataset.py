from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class DatasetModel(BaseModel):
    id: UUID
    name: str
    scale: str
    status: str
    record_count: Optional[int]
    file_path: Optional[str]
    created_by: UUID
    created_at: datetime
