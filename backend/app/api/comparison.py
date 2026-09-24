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
        model_metrics_spark={
            "accuracy": results["spark_metrics"]["test_accuracy"],
            "f1": results["spark_metrics"]["f1"],
            "roc_auc": results["spark_metrics"]["roc_auc"]
        },
        model_metrics_python={
            "accuracy": results["python_metrics"]["test_accuracy"],
            "f1": results["python_metrics"]["f1"],
            "roc_auc": results["python_metrics"]["roc_auc"]
        }
    )

@router.post("/run")
async def run_comparison():
    return await get_dual_pipeline_results()
