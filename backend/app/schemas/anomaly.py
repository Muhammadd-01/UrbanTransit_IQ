from pydantic import BaseModel
from typing import List, Dict, Any

class AnomalyResponse(BaseModel):
    anomalies: List[Dict[str, Any]]
    total_anomalies: int
    detection_method: str
