from fastapi import APIRouter
from typing import List
from backend.app.schemas.dataset import DatasetCreate, DatasetResponse
from backend.app.services.dataset_service import list_datasets, generate_dataset, upload_dataset_to_hdfs

router = APIRouter()

@router.get("", response_model=List[DatasetResponse])
async def get_datasets():
    datasets = list_datasets()
    return [
        DatasetResponse(
            id=d["id"],
            name=d["name"],
            scale=d["scale"],
            status=d["status"],
            record_count=d.get("record_count", 0),
            created_at=d.get("created_at")
        )
        for d in datasets
    ]

@router.post("/generate", response_model=DatasetResponse)
async def create_dataset(request: DatasetCreate):
    record = generate_dataset(scale=request.scale)
    return DatasetResponse(
        id=record["id"],
        name=record["name"],
        scale=record["scale"],
        status=record["status"],
        record_count=record["record_count"],
        created_at=record["created_at"]
    )

@router.post("/{id}/upload-hdfs")
async def upload_to_hdfs(id: str):
    return upload_dataset_to_hdfs(id)
