from fastapi import APIRouter
from config.settings import settings
import yaml

router = APIRouter()

@router.get("/thresholds")
async def get_thresholds():
    with open("config/thresholds.yaml", "r") as f:
        return yaml.safe_load(f)

@router.get("/mode")
async def get_mode():
    return {
        "mode": settings.EXECUTION_MODE,
        "spark_master": settings.SPARK_MASTER,
        "hdfs_namenode": settings.HDFS_NAMENODE,
        "city": "Karachi, Pakistan"
    }
