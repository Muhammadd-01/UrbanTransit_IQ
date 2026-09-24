from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class DatasetCreate(BaseModel):
    name: str
    scale: str

class DatasetResponse(BaseModel):
    id: UUID
    name: str
    scale: str
    status: str
    record_count: Optional[int]
    created_at: datetime

class GenerationConfig(BaseModel):
    scale: str
    include_noise: bool = True
    noise_level: float = 0.1
