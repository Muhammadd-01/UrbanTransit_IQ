import logging

logger = logging.getLogger(__name__)

def analyze_occupancy(route_id: str):
    logger.info(f"Analyzing occupancy for route {route_id}")
    return {"route_id": route_id, "avg_occupancy": 0.65}
