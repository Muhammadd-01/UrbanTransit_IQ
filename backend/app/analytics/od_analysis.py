"""
Origin-Destination (OD) Matrix service modeling passenger movements across Karachi zones.
"""
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

def get_od_matrix(filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    zones = ["Saddar", "Clifton", "Gulshan", "Nazimabad", "Korangi", "Malir", "Surjani", "SITE"]
    
    # 8x8 matrix representing commuter flows
    matrix = [
        [0, 1420, 850, 620, 1100, 430, 210, 780],
        [1510, 0, 920, 480, 890, 310, 150, 620],
        [1890, 1340, 0, 910, 1240, 870, 520, 1150],
        [1420, 890, 810, 0, 620, 410, 780, 1290],
        [1650, 980, 1120, 510, 0, 920, 310, 840],
        [1410, 720, 950, 420, 890, 0, 210, 650],
        [2100, 1450, 1620, 1380, 920, 540, 0, 1480],
        [1250, 820, 1050, 1120, 760, 480, 920, 0],
    ]

    top_corridors = [
        {"origin": "Surjani", "destination": "Saddar", "volume": 2100, "dominant_route": "GL-01 (Green Line BRT)"},
        {"origin": "Gulshan", "destination": "Saddar", "volume": 1890, "dominant_route": "PB-01 (Peoples Bus)"},
        {"origin": "Korangi", "destination": "Saddar", "volume": 1650, "dominant_route": "PB-08"},
        {"origin": "Surjani", "destination": "SITE", "volume": 1480, "dominant_route": "GL-03"},
        {"origin": "Nazimabad", "destination": "Saddar", "volume": 1420, "dominant_route": "LB-04"},
    ]

    return {
        "status": "success",
        "zones": zones,
        "matrix": matrix,
        "top_corridors": top_corridors,
        "total_trips_sampled": 34820,
    }
