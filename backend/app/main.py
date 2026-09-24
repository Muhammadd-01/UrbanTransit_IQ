import sys
from pathlib import Path
import logging

# Ensure project root is always in Python module search path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from backend.app.api import auth, dashboard, datasets, quality, analytics, predictions, forecasting, clustering, anomalies, recommendations, simulations, comparison, reports, spark_jobs, settings_api, export
from backend.app.utils.mode_check import verify_competition_mode

logger = logging.getLogger(__name__)

app = FastAPI(title="UrbanTransit IQ API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:[0-9]+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(datasets.router, prefix="/api/datasets", tags=["datasets"])
app.include_router(quality.router, prefix="/api/quality", tags=["quality"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["predictions"])
app.include_router(forecasting.router, prefix="/api/forecasting", tags=["forecasting"])
app.include_router(clustering.router, prefix="/api/clustering", tags=["clustering"])
app.include_router(anomalies.router, prefix="/api/anomalies", tags=["anomalies"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])
app.include_router(simulations.router, prefix="/api/simulations", tags=["simulations"])
app.include_router(comparison.router, prefix="/api/comparison", tags=["comparison"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(spark_jobs.router, prefix="/api/spark-jobs", tags=["spark_jobs"])
app.include_router(settings_api.router, prefix="/api/settings", tags=["settings"])
app.include_router(export.router, prefix="/api/export", tags=["export"])

@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting application in {settings.EXECUTION_MODE} mode")
    if settings.EXECUTION_MODE == "COMPETITION":
        verify_competition_mode()

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/")
def root():
    return {"info": "UrbanTransit IQ API running"}
