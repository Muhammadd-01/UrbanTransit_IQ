from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class AuditLogModel(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    action: str
    entity_type: str
    entity_id: str
    details: Dict[str, Any]
    ip_address: Optional[str]
    timestamp: datetime

class DataQualityAuditModel(BaseModel):
    id: UUID
    dataset_id: UUID
    record_id: str
    original_value: Optional[str]
    issue_type: str
    affected_column: str
    cleaning_rule: str
    corrected_value: Optional[str]
    status: str
    timestamp: datetime
