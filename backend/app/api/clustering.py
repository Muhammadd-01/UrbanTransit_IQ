from fastapi import APIRouter
from backend.app.schemas.clustering import ClusteringResponse

router = APIRouter()

@router.get("/routes", response_model=ClusteringResponse)
async def get_route_clusters():
    return ClusteringResponse(
        clusters=[
            {
                "name": "High Demand / High Congestion Corridors",
                "description": "Dense urban lines traversing Saddar and M.A. Jinnah with peak loads >90% and delay variance >8m.",
                "centroid": {"avg_demand": 18500, "avg_occupancy": 0.92, "avg_delay": 12.4, "punctuality": 68.5},
                "members": ["PB-01", "PB-08", "LB-04", "LB-12"]
            },
            {
                "name": "High Frequency / High Reliability BRT",
                "description": "Dedicated right-of-way corridors with high capacity and on-time performance >90%.",
                "centroid": {"avg_demand": 24000, "avg_occupancy": 0.88, "avg_delay": 2.8, "punctuality": 92.5},
                "members": ["GL-01", "GL-02", "OL-01"]
            },
            {
                "name": "Suburban Feeder / Moderate Demand",
                "description": "Peripheral routes connecting Gulshan, Scheme 33, and Malir with steady off-peak usage.",
                "centroid": {"avg_demand": 8200, "avg_occupancy": 0.54, "avg_delay": 4.1, "punctuality": 84.0},
                "members": ["PB-14", "PB-18", "LB-22", "LB-31"]
            }
        ],
        silhouette_score=0.684,
        method="K-Means with PCA 2D Embedding"
    )

@router.get("/passengers")
async def get_passenger_segments():
    return {
        "segments": [
            {"name": "Daily Commercial Commuters", "percentage": 58.2, "peak_usage": "08:00 & 18:00"},
            {"name": "Student Transit Users", "percentage": 22.4, "peak_usage": "07:30 & 14:00"},
            {"name": "Off-Peak Retail & Leisure", "percentage": 14.1, "peak_usage": "11:00 - 16:00"},
            {"name": "Inter-City Transfers", "percentage": 5.3, "peak_usage": "Late Evening"}
        ]
    }
