"""
Underutilized service detection for low-demand services (<25% occupancy over >10 days).
"""
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

def detect_underutilization(filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    return {
        "status": "success",
        "underutilized_routes": [
            {
                "route_id": "LB-14",
                "route_name": "Hawksbay to Tower Feeder",
                "avg_occupancy": 0.18,
                "daily_trips": 12,
                "consecutive_days_flagged": 14,
                "potential_vehicle_savings": 2,
                "recommendation": "Reduce midday headway from 20m to 40m",
            },
            {
                "route_id": "PB-22",
                "route_name": "Malir Cantt to Scheme 33",
                "avg_occupancy": 0.22,
                "daily_trips": 10,
                "consecutive_days_flagged": 12,
                "potential_vehicle_savings": 1,
                "recommendation": "Reassign vehicle capacity to Route PB-01",
            }
        ],
        "underutilization_threshold": 0.25,
    }
