from pydantic import BaseModel
from typing import Dict, Any, Optional

class ExportRequest(BaseModel):
    entity_type: str
    format: str
    filters: Optional[Dict[str, Any]]

class ExportResponse(BaseModel):
    file_path: str
    record_count: int
    format: str
