from fastapi import APIRouter
from fastapi.responses import JSONResponse
from backend.app.schemas.export import ExportRequest, ExportResponse

router = APIRouter()

@router.post("/data", response_model=ExportResponse)
async def export_data(request: ExportRequest):
    return ExportResponse(
        file_path=f"reports/exports/{request.entity_type}.{request.format}",
        record_count=1000,
        format=request.format
    )

@router.post("/results", response_model=ExportResponse)
async def export_results(request: ExportRequest):
    return ExportResponse(
        file_path=f"reports/exports/results_{request.entity_type}.{request.format}",
        record_count=500,
        format=request.format
    )
