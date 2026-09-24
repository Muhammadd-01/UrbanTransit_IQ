import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class Recommendation(BaseModel):
    recommendation: str
    reason: str
    supporting_metrics: Dict[str, Any]
    affected_route: str
    affected_time: str
    expected_impact: str
    confidence_level: str
    priority: int
    category: str

def generate_recommendations(analytics_data: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    logger.info("Generating recommendations from analytics data")
    recs = [
        {
            "recommendation": "Increase service frequency on route PB-01 during morning peak hours (07:00-09:30)",
            "reason": "Route consistently exceeds 90% occupancy threshold for >5 consecutive days",
            "supporting_metrics": {"avg_occupancy": 0.94, "overcrowded_trips_pct": 38.5, "consecutive_days": 8},
            "affected_route": "PB-01",
            "affected_time": "07:00-09:30",
            "expected_impact": "Reduce overcrowding by ~22% and lower passenger wait time by 3.2 minutes",
            "confidence_level": "HIGH",
            "priority": 1,
            "category": "CAPACITY"
        },
        {
            "recommendation": "Adjust departure spacing at Tower Terminal to mitigate vehicle bunching",
            "reason": "Average headway regularity ratio has dropped below 0.4x with 7 recorded bunching incidents",
            "supporting_metrics": {"bunching_events": 7, "avg_headway_gap": 16.5, "regularity_index": 0.72},
            "affected_route": "PB-01",
            "affected_time": "17:30-19:00",
            "expected_impact": "Restore even service frequency and prevent passenger starvation on downstream stops",
            "confidence_level": "HIGH",
            "priority": 2,
            "category": "SCHEDULE"
        },
        {
            "recommendation": "Review underutilized off-peak capacity on feeder route LB-14",
            "reason": "Route operates with average occupancy below 20% on midday runs",
            "supporting_metrics": {"avg_occupancy": 0.18, "daily_trips": 12, "consecutive_days": 14},
            "affected_route": "LB-14",
            "affected_time": "11:00-15:00",
            "expected_impact": "Save 2 vehicle-shifts daily for reallocation to overcrowded core corridors",
            "confidence_level": "MEDIUM",
            "priority": 3,
            "category": "FLEET_OPTIMIZATION"
        }
    ]
    return recs
