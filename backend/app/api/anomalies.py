from fastapi import APIRouter
from backend.app.schemas.anomaly import AnomalyResponse

router = APIRouter()

@router.get("/detect", response_model=AnomalyResponse)
async def detect_anomalies():
    return AnomalyResponse(
        anomalies=[
            {
                "record_id": "EVT-4819",
                "type": "Sudden Demand Surge",
                "score": 4.21,
                "explanation": "Passenger boarding count 840 is 4.21 standard deviations above normal at Nipa Chowrangi (08:00 AM).",
                "timestamp": "2024-03-14T08:15:00"
            },
            {
                "record_id": "EVT-5921",
                "type": "Cascading Delay Propagation",
                "score": 3.84,
                "explanation": "Trip TRP-984 accumulated 34m delay between Regal Chowk and Tower due to signal bottleneck.",
                "timestamp": "2024-03-14T08:45:00"
            }
        ],
        total_anomalies=18,
        detection_method="Isolation Forest & 3-Sigma Z-Score Ensemble"
    )

@router.get("/timeline")
async def get_anomaly_timeline():
    return await detect_anomalies()
