from fastapi import APIRouter
from backend.app.schemas.quality import DataQualityReport

router = APIRouter()

@router.get("/report/{dataset_id}", response_model=DataQualityReport)
async def get_quality_report(dataset_id: str):
    return DataQualityReport(
        total_records=2000000,
        valid=1948200,
        invalid=51800,
        missing=32100,
        duplicates=12400,
        outliers=7300,
        invalid_references=0,
        completeness=98.4,
        consistency=99.1,
        validity=97.4,
        overall_quality=98.3
    )

@router.get("/audit/{dataset_id}")
async def get_audit_trail(dataset_id: str):
    return [
        {
            "record_id": "TKT-89214",
            "original_value": "-4",
            "issue_type": "impossible_passenger_count",
            "affected_column": "boarding_count",
            "cleaning_rule": "clamp_to_zero",
            "corrected_value": "0",
            "status": "CORRECTED"
        },
        {
            "record_id": "DLY-1249",
            "original_value": "240.0",
            "issue_type": "extreme_delay_outlier",
            "affected_column": "delay_minutes",
            "cleaning_rule": "cap_at_120m",
            "corrected_value": "120.0",
            "status": "FLAGGED"
        }
    ]
