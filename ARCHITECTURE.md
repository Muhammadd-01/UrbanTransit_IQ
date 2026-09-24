# UrbanTransit IQ — Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                             │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  React Frontend (Plotly + Leaflet)                                │  │
│  │  Dashboard │ Analytics │ ML │ Forecasting │ Simulator │ Reports  │  │
│  └──────────────────────────────┬───────────────────────────────────┘  │
│                                 │ REST API (JSON)                       │
│  ┌──────────────────────────────┴───────────────────────────────────┐  │
│  │  FastAPI Backend                                                  │  │
│  │  Auth │ Routes │ Middleware │ Services │ Error Handling           │  │
│  └──────┬────────────┬─────────────┬────────────────────────────────┘  │
│         │            │             │                                    │
├─────────┼────────────┼─────────────┼────────────────────────────────────┤
│         │  PROCESSING LAYER        │                                    │
│  ┌──────┴─────┐ ┌────┴────┐ ┌─────┴──────┐                           │
│  │ Pipeline A │ │Analytics│ │ Pipeline B  │                           │
│  │ Spark/HDFS │ │ Services│ │ Python/Pandas│                          │
│  │ PySpark    │ │         │ │ scikit-learn │                          │
│  │ Spark SQL  │ │         │ │ XGBoost     │                          │
│  │ Spark MLlib│ │         │ │ Statsmodels │                          │
│  └──────┬─────┘ └────┬────┘ └─────┬──────┘                           │
│         │            │             │                                    │
├─────────┼────────────┼─────────────┼────────────────────────────────────┤
│         │    DATA LAYER            │                                    │
│  ┌──────┴────────────┴─────────────┴──────┐                           │
│  │         HDFS (Competition Mode)         │                           │
│  │    /urbantransit/raw/                   │                           │
│  │    /urbantransit/cleaned/               │                           │
│  │    /urbantransit/parquet/               │                           │
│  │    /urbantransit/models/                │                           │
│  └────────────────────────────────────────┘                           │
│  ┌────────────────────────────────────────┐                           │
│  │         Supabase (PostgreSQL)           │                           │
│  │    Users │ Audit │ Models │ Jobs       │                           │
│  │    Predictions │ Reports │ Config      │                           │
│  └────────────────────────────────────────┘                           │
│  ┌────────────────────────────────────────┐                           │
│  │         Local Filesystem                │                           │
│  │    data/raw/ │ data/cleaned/           │                           │
│  │    data/parquet/ │ models/             │                           │
│  └────────────────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
Data Generator → CSV files → data/raw/
                                  │
                    ┌─────────────┼──────────────┐
                    │             │              │
              HDFS Upload    Python Load    Supabase Metadata
                    │             │              │
              PySpark        Pandas           Track datasets
              Ingestion      Ingestion        Track jobs
                    │             │
              Schema         Dtype
              Validation     Parsing
                    │             │
              Spark          Python
              Data Quality   Data Quality
                    │             │
              Cleaning       Cleaning
                    │             │
              Feature        Feature
              Engineering    Engineering
                    │             │
              Parquet        DataFrames
              (Partitioned)
                    │             │
              Spark MLlib    scikit-learn
              Models         XGBoost Models
                    │             │
              Predictions    Predictions
                    │             │
                    └──────┬──────┘
                           │
                    Dual Pipeline
                    Comparison
                           │
                    Dashboard API
                           │
                    React Frontend
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18, Plotly.js, Leaflet, React Router | Interactive dashboard |
| Backend | Python 3.11, FastAPI | REST API |
| Auth | JWT + bcrypt (python-jose, passlib) | Authentication |
| Database | Supabase (PostgreSQL) | Application metadata |
| Big Data | Hadoop 3.3.6, HDFS | Distributed storage |
| Processing | PySpark 3.5.1, Spark SQL | Distributed processing |
| ML (Spark) | Spark MLlib | Distributed ML |
| ML (Python) | scikit-learn, XGBoost | Independent ML pipeline |
| Forecasting | Statsmodels (SARIMA), XGBoost | Time-series forecasting |
| Data Format | CSV, Parquet, JSON | Data interchange |
| Config | Pydantic Settings, YAML | Configuration management |
| Testing | pytest | Test framework |
| Logging | Python logging (JSON) | Structured logging |

## Execution Modes

### DEVELOPMENT Mode
- Local filesystem instead of HDFS
- Spark runs in local[*] mode
- Small dataset for fast iteration
- Supabase optional (graceful fallback)

### COMPETITION Mode
- Genuine HDFS required and verified
- Spark connects to configured master
- Full dataset processing
- All validations enforced
- HDFS evidence generated

## Memory Budget (16 GB Mac)

| Component | Allocation |
|-----------|-----------|
| HDFS (NameNode + DataNode) | ~2 GB |
| Spark (Driver + Executor) | ~4 GB |
| FastAPI Backend | ~1 GB |
| React Dev Server | ~0.5 GB |
| OS + Desktop | ~4 GB |
| Buffer | ~4.5 GB |
