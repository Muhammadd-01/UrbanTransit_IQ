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
            affected_route=r.get("affected_route"),
            affected_time=r.get("affected_time"),
            expected_impact=r.get("expected_impact", ""),
            confidence_level=r.get("confidence_level", "MEDIUM"),
            priority=r.get("priority", 2),
            category=r.get("category", "CAPACITY")
        )
        for r in recs
    ]

@router.post("/generate", response_model=List[RecommendationResponse])
async def trigger_recommendations():
    return await list_recommendations()
