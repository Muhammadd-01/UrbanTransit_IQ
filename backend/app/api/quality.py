from fastapi import APIRouter
from typing import Dict, Any, List
from backend.app.schemas.quality import DataQualityReport
from backend.app.analytics.data_quality import analyze_quality

router = APIRouter()

@router.get("/summary")
async def get_quality_summary():
    report = analyze_quality()
    return report

@router.get("/audits")
async def get_quality_audits():
    report = analyze_quality()
    return report.get("record_level_audit", [])

@router.get("/report/{dataset_id}", response_model=DataQualityReport)
async def get_quality_report(dataset_id: str):
    rep = analyze_quality()
    return DataQualityReport(
        total_records=rep["total_records"],
        valid=rep["valid_records"],
        invalid=rep["total_records"] - rep["valid_records"],
        missing=rep["issue_counts_by_type"].get("missing_ticket_ids", 0) + rep["issue_counts_by_type"].get("missing_route_ids", 0),
        duplicates=rep["issue_counts_by_type"].get("duplicate_transactions", 0) + rep["issue_counts_by_type"].get("duplicate_trips", 0),
        outliers=rep["issue_counts_by_type"].get("capacity_violations", 0) + rep["issue_counts_by_type"].get("invalid_delays", 0),
        invalid_references=rep["issue_counts_by_type"].get("invalid_stop_ids", 0) + rep["issue_counts_by_type"].get("unknown_passengers", 0),
        completeness=rep["completeness_pct"],
        consistency=rep["consistency_pct"],
        validity=rep["validity_pct"],
        overall_quality=rep["overall_quality_pct"]
    )

@router.get("/audit/{dataset_id}")
async def get_audit_trail(dataset_id: str):
    rep = analyze_quality()
    return rep.get("record_level_audit", [])
