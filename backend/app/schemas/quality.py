from pydantic import BaseModel
from typing import Dict, Any

class DataQualityReport(BaseModel):
    total_records: int
    valid: int
    invalid: int
    missing: int
    duplicates: int
    outliers: int
    invalid_references: int
    completeness: float
    consistency: float
    validity: float
    overall_quality: float
