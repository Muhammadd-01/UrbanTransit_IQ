from fastapi import APIRouter
from typing import List
from backend.app.schemas.recommendation import RecommendationResponse
from recommendation_engine.engine import generate_recommendations

router = APIRouter()

@router.get("", response_model=List[RecommendationResponse])
async def list_recommendations():
    recs = generate_recommendations()
    return [
        RecommendationResponse(
            recommendation=r["recommendation"],
            reason=r["reason"],
            supporting_metrics=r["supporting_metrics"],
            affected_route=r["affected_route"],
            affected_time=r["affected_time"],
            expected_impact=r["expected_impact"],
            confidence_level=r["confidence_level"]
        )
        for r in recs
    ]

@router.post("/generate", response_model=List[RecommendationResponse])
async def trigger_recommendations():
    return await list_recommendations()
