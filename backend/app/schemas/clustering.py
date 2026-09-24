from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ClusteringResponse(BaseModel):
    clusters: List[Dict[str, Any]]
    silhouette_score: Optional[float]
    method: str
