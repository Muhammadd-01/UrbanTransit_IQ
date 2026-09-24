# AI Usage Declaration — UrbanTransit IQ

As required by the competition rules, this document declares all AI tool usage in the development of UrbanTransit IQ.

## AI Tool Used

| Tool | Purpose | Scope |
|------|---------|-------|
| Google Gemini (Antigravity) | Code generation, architecture design, debugging | All modules |

## Detailed Usage Log

### Phase 1 — Architecture & Foundation
- **Purpose**: Project structure setup, FastAPI boilerplate, Supabase schema design, React scaffold
- **Files affected**: All initial project files
- **Assistance received**: Code generation for project skeleton, configuration system, API route definitions
- **Modifications made**: All generated code reviewed, customized for Karachi transit context, tested
- **Testing performed**: Manual verification of project structure, import checks, linting

### Phase 2 — Dataset Generator
- **Purpose**: Synthetic data generator for Karachi transit network
- **Files affected**: `data_generator/` module
- **Assistance received**: Generator logic for realistic correlations, noise injection
- **Modifications made**: Karachi-specific routes, stops, and geographic coordinates verified
- **Testing performed**: Data consistency checks, relationship validation, scale verification

### Phase 3 — Big Data Infrastructure
- **Purpose**: Hadoop/HDFS setup scripts, Spark configuration, PySpark pipelines
- **Files affected**: `hadoop/`, `spark_jobs/`, `spark_sql/`, `spark_ml/`
- **Assistance received**: Setup scripts, Spark job templates, MLlib model training code
- **Modifications made**: Memory settings tuned for 16 GB Mac, partition strategy customized
- **Testing performed**: HDFS verification, Spark job execution, Parquet output validation

### Phase 4-9 — Analytics, ML, Forecasting, Decision Intelligence
- **Purpose**: Analytical modules, ML models, forecasting, recommendations, simulations
- **Files affected**: Backend analytics services, ML pipelines, Python pipeline
- **Assistance received**: Algorithm implementation, feature engineering, evaluation metrics
- **Modifications made**: Model selection based on actual validation results, threshold tuning
- **Testing performed**: Unit tests, metric validation, pipeline independence verification

### Phase 10 — Frontend
- **Purpose**: React dashboard with Plotly charts and Leaflet maps
- **Files affected**: `frontend/src/` components and pages
- **Assistance received**: Component structure, chart integration, responsive layout
- **Modifications made**: Design customized to professional transit intelligence aesthetic
- **Testing performed**: Visual inspection, responsive testing, API integration testing

## Verification Statement

All AI-generated code has been:
1. ✅ Reviewed by team members
2. ✅ Understood and can be explained
3. ✅ Modified where necessary for project-specific requirements
4. ✅ Tested with actual data and verified outputs
5. ✅ Documented with clear comments and docstrings

## Team Members Who Reviewed AI-Generated Code

| Member | Modules Reviewed |
|--------|-----------------|
| Muhammad Affan | All modules, architecture, integration |
| Muhammad Hammad | Data generator, Spark jobs, HDFS pipeline |
| Shahmir Qadri | ML models, forecasting, anomaly detection |
| Waqas Rehman | Frontend, analytics visualizations, reports |
