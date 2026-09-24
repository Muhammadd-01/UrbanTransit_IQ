from pydantic import BaseModel
from typing import List, Dict, Any

class DualPipelineComparisonResponse(BaseModel):
    cases: List[Dict[str, Any]]
    summary_stats: Dict[str, float]
    agreement_rate: float
    model_metrics_spark: Dict[str, float]
    model_metrics_python: Dict[str, float]
