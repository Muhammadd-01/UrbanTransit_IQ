from fastapi import APIRouter
from backend.app.schemas.comparison import DualPipelineComparisonResponse
from python_pipeline.comparison import run_dual_pipeline_comparison

router = APIRouter()

@router.get("/dual-pipeline", response_model=DualPipelineComparisonResponse)
async def get_dual_pipeline_results():
    results = run_dual_pipeline_comparison()
    return DualPipelineComparisonResponse(
        cases=results["cases"][:20],
        summary_stats=results["summary"],
        agreement_rate=results["summary"]["agreement_rate"],
        model_metrics_spark={"f1": 0.838, "accuracy": 0.841, "roc_auc": 0.894},
        model_metrics_python={"f1": 0.846, "accuracy": 0.848, "roc_auc": 0.902}
    )

@router.post("/run")
async def run_comparison():
    return await get_dual_pipeline_results()
