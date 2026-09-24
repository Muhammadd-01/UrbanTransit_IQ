from fastapi import APIRouter
from backend.app.services.spark_monitor_service import list_spark_jobs

router = APIRouter()

@router.get("")
async def get_spark_jobs():
    return list_spark_jobs()

@router.get("/{id}")
async def get_spark_job(id: str):
    jobs = list_spark_jobs()
    for j in jobs:
        if j["id"] == id:
            return j
    return {"error": "Job not found"}
