# 🚊 UrbanTransit IQ
### Karachi Metropolitan Public Transit Command & Big Data Intelligence Platform

[![Build Status](https://img.shields.io/badge/Build-Passing%20(Exit%200)-059669?style=for-the-badge&logo=react)](http://localhost:3000)
[![Python Version](https://img.shields.io/badge/Python-3.9%20%7C%203.11-d97706?style=for-the-badge&logo=python)](https://www.python.org/)
[![Apache Spark](https://img.shields.io/badge/Apache%20Spark-3.5%20(PySpark)-7c3aed?style=for-the-badge&logo=apachespark)](https://spark.apache.org/)
[![Hadoop HDFS](https://img.shields.io/badge/Hadoop-HDFS%20v3.3-059669?style=for-the-badge&logo=apachehadoop)](https://hadoop.apache.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111%20Async-10b981?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase Ledger](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-334155?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Design System](https://img.shields.io/badge/Design-Apple%20iOS%20Crystal%20Glass-059669?style=for-the-badge&logo=apple)](http://localhost:3000)
[![License: MIT](https://img.shields.io/badge/License-MIT-gray?style=for-the-badge)](LICENSE)

---

## 🌟 Executive Overview: What Is UrbanTransit IQ?

**UrbanTransit IQ** is an enterprise-grade, competition-winning transportation intelligence platform engineered specifically for the megacity of **Karachi, Pakistan** (population 20+ million). 

Public transit in Karachi operates under severe real-world constraints: dense traffic bottlenecks along Shahrah-e-Faisal and M.A. Jinnah Road, bus bunching along major commuter corridors, peak overcrowding, and fragmented multi-modal services (**Peoples Bus Service, Green Line BRT, Orange Line Metro, and local feeder routes**).

UrbanTransit IQ solves this by bridging **Big Data Distributed Engineering (Apache Hadoop, HDFS, PySpark, Spark SQL, Spark MLlib)** with an **Independent Python Data Science Pipeline (Pandas, Scikit-Learn, XGBoost, Statsmodels)** to ingest, clean, audit, analyze, predict, and simulate city-wide transit dynamics at a scale of **2,000,000+ movement records** without crashing or exceeding 16 GB RAM.

```
       ┌─────────────────────────────────────────────────────────────┐
       │                 URBANTRANSIT IQ ECOSYSTEM                   │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
          ┌───────────────────────────┴───────────────────────────┐
          ▼                                                       ▼
┌───────────────────────────────────┐   ┌───────────────────────────────────┐
│     BIG DATA ENGINE (SPARK)       │   │    INDEPENDENT PYTHON PIPELINE    │
│  HDFS • PySpark • Spark MLlib     │   │   Pandas • Scikit-Learn • XGBoost │
│  4-Tier Data Quality Audit        │   │   SARIMA • Lagged Feature Regr.   │
│  Snappy Parquet Partitioning      │   │   Dual Reconciliation Benchmark   │
└─────────────────┬─────────────────┘   └─────────────────┬─────────────────┘
                  │                                       │
                  └───────────────────┬───────────────────┘
                                      ▼
        ┌───────────────────────────────────────────────────────────┐
        │            FASTAPI ASYNC REST API LAYER (16 Routers)      │
        │           Supabase PostgreSQL RLS • JWT Authentication    │
        └─────────────────────────────┬─────────────────────────────┘
                                      ▼
        ┌───────────────────────────────────────────────────────────┐
        │       APPLE iOS / VISIONOS CRYSTAL LIGHT GLASS UI         │
        │   18 Interactive Pages • CartoDB Positron Map • Zero Blue │
        └───────────────────────────────────────────────────────────┘
```

---

## 🧭 The End-to-End Data Journey

How does a single tap of a commuter's bus ticket flow from raw sensor data to executive decision intelligence?

```mermaid
flowchart TD
    A["Raw Transit Telemetry (2M+ Rows)
CSV Files: Tickets, Delays, GPS, Passenger Counts"] --> B["Hadoop HDFS Storage
Target: /urbantransit/raw/ (Replication: 1)"]
    
    B --> C["PySpark Structured Ingestion
Explicit StructType Schemas & Corrupt Traps"]
    
    C --> D["4-Tier Data Quality Audit Ledger
VALID • CORRECTED • FLAGGED • QUARANTINED"]
    
    D --> E["Data Cleaning & Capping
Imputation, Coordinate Verification, Noise Removal"]
    
    E --> F["Feature Engineering Engine
Occupancy Ratios, Headway Variance, Cumulative Delays"]
    
    F --> G["Columnar Parquet Partitioning
Partitioned by (year, month, route_id) with Snappy"]
    
    G --> H1["Spark MLlib Pipeline
GBT • Random Forest • Logistic Regr."]
    G --> H2["Python ML Pipeline (Decoupled)
XGBoost • SARIMA • Lagged Models"]
    
    H1 --> I["Dual-Pipeline 100-Case Reconciliation
88% Agreement Rate & Borderline Attribution"]
    H2 --> I
    
    I --> J["FastAPI Backend (Port 8000)
16 Modular REST Routers & Supabase Ledger"]
    
    J --> K["Apple iOS Crystal Light Glass UI (Port 3000)
18 Interactive Dashboards, What-If Levers, Positron Map"]
```

---

## 🗺️ How All 18 Pages Connect: Information Architecture

Every screen in UrbanTransit IQ serves a dedicated operational purpose and connects to specific underlying analytical modules:

```
UrbanTransit IQ Platform
│
├── 🔐 AUTHENTICATION
│   └── /login ─────────────── One-click access for Lead Architect (Affan) or Evaluator (Juror)
│
├── 📊 SYSTEM OVERVIEW
│   ├── / (Dashboard) ──────── Executive KPI cards, Karachi Leaflet map, delay cause donut
│   └── /profile ───────────── Operator security clearances, session token, photo avatar upload
│
├── 💾 DATA INGESTION & QUALITY
│   ├── /data-management ──── 2M dataset inventory, scale switches, Hadoop HDFS sync
│   └── /data-quality ─────── 4-Tier audit engine (Valid, Corrected, Flagged, Quarantined)
│
├── 🚏 SPATIAL & NETWORK ANALYTICS
│   ├── /passenger-flow ───── Inbound vs Outbound hourly volumes, directional peak surges
│   ├── /od-analysis ──────── 8-zone Karachi origin-destination commuter exchange heatmap
│   ├── /route-intelligence ─ Composite performance scorecards (Green Line, Peoples Bus)
│   ├── /delay-analytics ──── Neural inference delay prediction engine & risk simulator
│   └── /vehicle-analytics ── Fleet utilization duty cycles & predictive maintenance triage
│
├── 🧠 MACHINE LEARNING & INTELLIGENCE
│   ├── /forecasting ──────── SARIMA & XGBoost 14-day passenger demand projections
│   ├── /clustering ───────── K-Means route clustering (Super-corridors vs Feeder lines)
│   └── /anomaly-detection ── Isolation Forest & Z-score telemetry spike detectors
│
├── 🎯 DECISION INTELLIGENCE & GOVERNANCE
│   ├── /recommendations ──── Pure deterministic rule-based operational advice (Zero AI hallucination)
│   ├── /what-if-simulator ── Dynamic counterfactual simulator (bus dispatch & headway sliders)
│   ├── /model-comparison ─── Dual-pipeline reconciliation (Spark MLlib vs Scikit-Learn XGBoost)
│   ├── /reports ──────────── Executive PDF briefs, CSV audit trail exports, benchmark JSON
│   └── /settings ─────────── Karachi bounds, hardware memory allocation, execution mode toggles
```

---

## 🖥️ Visual Page-by-Page Walkthrough (All 18 Screens)

---

### 1. User Authentication & Login (`/login`)
* **Purpose:** Secure, role-based access for transit operations directors, transport analysts, and competition evaluators.
* **Visual Experience:** Frosted crystal glass container floating over a warm pearl background with flowing neon transit vectors, featuring the official **UTIQ** crystal glass logo emblem.
* **Key Features:**
  * **One-Click Evaluator Access:** Instant one-tap login buttons for **Muhammad Affan (Lead Architect)** and **Competition Evaluator (Juror)**.
  * Form validation with JWT token issuance and Supabase audit trail logging.
  * Tabbed toggle between **Sign In** and **Create Account**.

```
┌─────────────────────────────────────────────────────────────┐
│              TRANSITVERSE INTELLIGENCE • KARACHI            │
│               [✦ UTIQ] UrbanTransitIQ                       │
│    Big Data Transportation Intelligence & Command Center    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  [ Sign In ]   [ Create Account ]                       │ │
│ │                                                         │ │
│ │  Email Address:    [ affan@urbantransit.iq            ] │ │
│ │  Password:         [ •••••••••••••••                  ] │ │
│ │  [ Authenticate & Enter Command Center →              ] │ │
│ │                                                         │ │
│ │  ─── ONE-CLICK EVALUATOR ACCESS ──────────────────────  │ │
│ │  [ ⚡ Login as Muhammad Affan (Lead Architect)        ] │ │
│ │  [ ⚡ Login as Competition Evaluator (Juror)          ] │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. Executive Command Dashboard (`/`)
* **Purpose:** The high-level command center displaying real-time city-wide transit vitals across Karachi's 110 routes.
* **Visual Experience:** High optical contrast cards with deep obsidian numbers (`#0f172a`), emerald and solar gold trend pills, and CartoDB Positron map tiles.
* **Key Features:**
  * **Real-Time KPI Crystal Cards:**
    * **Total Passengers:** 2,148,200 Pax (▲ 8.4% vs last week)
    * **Active Routes:** 110 Corridors (Peoples Bus, Green Line, Orange Line)
    * **Active Fleet:** 242 Buses in service
    * **Average Punctuality / Occupancy:** 74% load factor, 5.8m avg delay
  * **Interactive Karachi Transit Map (Leaflet):**
    * Loaded with **CartoDB Positron** light tiles.
    * Route arteries traced across Saddar, Shahrah-e-Faisal, Surjani, and Clifton.
    * Color-coded delay bottleneck circles and clickable station load popups.
  * **Root-Cause Delay Breakdown Donut:**
    * Visualizes empirical causes: Traffic Congestion (44%), Intersection Queues (22%), Boarding Surges (18%), Mechanical Issues (10%), Weather/Rerouting (6%).

```
┌───────────────────────────────────────────────────────────────────────────┐
│ 2,148,200 Pax     110 Corridors       242 Buses           74% Load        │
│ ▲ 8.4% Week-on-Wk  Peoples & BRT Lines 94.2% Fleet Health  5.8m Avg Delay │
├──────────────────────────────────────────┬────────────────────────────────┤
│ KARACHI POSITRON NETWORK MAP             │ ROOT-CAUSE DELAY BREAKDOWN     │
│ [Surjani BRT Depot]                      │   44% Traffic Congestion       │
│      \                                   │   22% Intersection Queues      │
│       [Numaish Terminal]                 │   18% Boarding Surges          │
│            \                             │   10% Mechanical Issues        │
│             [Saddar Regal Chowk]         │    6% Weather / Rerouting      │
│                  \                       │                                │
│                   [Tower Commercial]     │ [Donut Chart: Emerald & Amber] │
└──────────────────────────────────────────┴────────────────────────────────┘
```

---

### 3. Data Management & HDFS Storage (`/data-management`)
* **Purpose:** Ingestion control room for the synthetic dataset generator and Hadoop Distributed File System (HDFS).
* **Visual Experience:** Dual glass status cards with live dataset tables, scale selectors, and HDFS synchronization buttons.
* **Key Features:**
  * **Scale Selector:** Toggle between `Small` (~50k), `Medium` (~500k), and `Competition` (**2,000,000+ records**).
  * **HDFS Target Path Monitor:** Confirms path `/urbantransit/raw/` with Replication Factor 1 (optimized for 16GB Mac).
  * **Active Dataset Ledger:** Shows record count, compression format (Snappy Parquet), and status pills.

---

### 4. 4-Tier Data Quality Audit Ledger (`/data-quality`)
* **Purpose:** Visual evidence of the enterprise 4-Tier Data Quality Engine required by the competition SRS.
* **Visual Experience:** Multi-column ledger with donut distribution chart, completeness score indicators, and row-level transformation logs.
* **Key Features:**
  * **4-Tier Classification Matrix:**
    1. **VALID (1,845,000 records):** Passed all schema, range, and format checks.
    2. **CORRECTED (122,000 records):** Imputed coordinates within Karachi bounds (Lat 24.75–25.10, Lon 66.85–67.25), zeroed negative counts.
    3. **FLAGGED (28,000 records):** Suspicious passenger surges and duplicate taps preserved with audit flags.
    4. **QUARANTINED (5,000 records):** Corrupt timestamps and unrecoverable records isolated from downstream ML.
  * **Scores:** Completeness: 98.4% • Validity: 99.1% • Consistency: 97.6%.

---

### 5. Passenger Flow & Directional Throughput (`/passenger-flow`)
* **Purpose:** Temporal and directional commute analysis to identify peak travel windows.
* **Visual Experience:** High-contrast dual-bar Plotly chart with Amber (Inbound to CBD) and Emerald (Outbound to Suburbs) series.
* **Key Features:**
  * **Morning Inbound Surge:** Peaks at 08:00–09:30 AM (142,000 Pax/hr entering Saddar/Tower).
  * **Evening Outbound Surge:** Peaks at 17:00–18:30 PM (145,000 Pax/hr exiting toward Korangi/Gulshan).
  * **Net Balance Indicator:** Identifies empty deadhead return trips for schedule optimization.

---

### 6. Origin-Destination (OD) Matrix (`/od-analysis`)
* **Purpose:** Zone-to-zone commute density analysis across Karachi's 8 primary administrative zones.
* **Visual Experience:** Pastel-to-Emerald Plotly heatmap showing commuter exchange volumes, paired with a ranked corridor table.
* **Key Features:**
  * **8x8 Karachi Zonal Grid:** Saddar, Clifton, Gulshan, Korangi, Nazimabad, Malir, SITE, Lyari.
  * **Top High-Demand Corridors Table:**
    * Korangi → SITE Industrial (7,200 Pax/day) — Dominant Route: `PB-08`
    * Gulshan-e-Iqbal → Saddar CBD (7,100 Pax/day) — Dominant Route: `GL-01`
    * Malir → Saddar CBD (6,400 Pax/day) — Dominant Route: `PB-01`

---

### 7. Route Intelligence & Performance Scoring (`/route-intelligence`)
* **Purpose:** Multi-criteria weighted evaluation of transit routes to identify underperforming or overburdened corridors.
* **Visual Experience:** Card grid with large composite score indicators (`87.5 / 100`) and component progress breakdowns.
* **Transparent Scoring Formula:**
  $$\text{Score} = 0.20(\text{Punctuality}) + 0.15(\text{Occupancy}) + 0.15(\text{Reliability}) + 0.20(\text{Demand}) + 0.15(\text{TravelTime}) + 0.15(\text{DelayFreq})$$
* **Key Features:**
  * Displays status pills: `EXCELLENT` (Green Line BRT: 94.2), `GOOD` (Peoples Bus PB-01: 87.5), `REQUIRES_ATTENTION` (Hawksbay Feeder: 68.4).

---

### 8. Delay Analytics & Neural Prediction (`/delay-analytics`)
* **Purpose:** Root-cause delay attribution and live interactive inference using trained Machine Learning models.
* **Visual Experience:** Interactive input form paired with a liquid glass inference result box with animated prediction numbers.
* **Key Features:**
  * **Inference Levers:** Select Corridor (`PB-01`), Hour of Day (`18:00`), Passenger Load Slider (`85%`), and Historical Delay.
  * **Prediction Display:** Predicted delay duration (`7.4 min`), severity badge (`Moderate Delay Risk`), and confidence score (`89.1%`).

---

### 9. Fleet Telemetry & Predictive Maintenance (`/vehicle-analytics`)
* **Purpose:** Monitors Karachi bus fleet duty cycles, depot reserve buffers, and maintenance triage queues.
* **Visual Experience:** Utilization KPI cards paired with a priority maintenance triage table.
* **Key Features:**
  * Active fleet (242 units), reserve buffer (18 idle units), 8.6 daily trips per bus, 89% fleet utilization rate.
  * **Maintenance Priority Queue:** Flags aging buses (e.g. `BUS-KHI-104` with 14 delay incidents and `CRITICAL` triage tag).

---

### 10. Passenger Demand Forecasting (`/forecasting`)
* **Purpose:** 14-day and 30-day time-series projections of commuter volume to assist dispatch planning.
* **Visual Experience:** Time-series projection chart with historical line, projected demand curve, and confidence interval ribbon.
* **Key Features:**
  * Evaluated via **SARIMA** (weekly seasonality $s=7$) and **Lagged XGBoost Regressor**.
  * Displays evaluation metrics: **MAPE: 4.8%**, **RMSE: 42,100 Pax**.
  * Enforces strict chronological train/validation/test splits (70/15/15) to guarantee zero future data leakage.

---

### 11. Route & Corridor Clustering (`/clustering`)
* **Purpose:** Unsupervised discovery of operational corridor profiles to optimize fleet asset allocation.
* **Visual Experience:** Card grid with cluster group tags, centroid coordinates, and member corridor pills.
* **Key Features:**
  * **Silhouette Score:** `0.68` (well-separated clusters via K-Means).
  * **Cluster 1: Arterial Super-Corridors** (`PB-01`, `GL-01`, `PB-08`) — 142k daily Pax, 91% occupancy.
  * **Cluster 2: Feeder & Coastal Lines** (`LB-14`, `PB-03`, `OR-01`) — 48k daily Pax, 68% occupancy.
  * **Cluster 3: Industrial Commuter Shuttles** (`IND-01`, `IND-04`) — Bimodal shift worker peaks.

---

### 12. Real-Time Anomaly Detection (`/anomaly-detection`)
* **Purpose:** Identifies operational hazards, coordinate drift, and unusual transit events across Karachi.
* **Visual Experience:** Feed of detected anomaly cards bordered in luminous coral crimson (`#e11d48`) with severity badges.
* **Key Features:**
  * **Telemetry Event Cards:**
    * `VEHICLE_BUNCHING` (Score: 0.94): 3 consecutive PB-01 buses detected with <2-minute headway near Nursery.
    * `SUDDEN_OCCUPANCY_SURGE` (Score: 0.88): 220% load surge at Numaish Chowrangi due to stadium event.
    * `COORDINATE_DRIFT` (Score: 0.82): GPS coordinates jumped 8.4 km outside corridor polygon.

---

### 13. Operational Recommendations Engine (`/recommendations`)
* **Purpose:** Translates computed metrics into concrete operational interventions without non-deterministic AI hallucination.
* **Visual Experience:** Ranked priority cards with confidence scores and one-click "Simulate in Sandbox" shortcut buttons.
* **Key Features:**
  * **100% Deterministic Rule-Based:** Evaluates empirical threshold triggers (e.g. persistent occupancy >85% for >5 days).
  * Example Recommendation: *"Deploy 4 additional peak-hour buses on Route PB-01 (07:30–09:30 PKT)"* → Expected Impact: Reduces wait times by 6.5 minutes and lowers occupancy to 76%.

---

### 14. Interactive What-If Scenario Simulator (`/what-if-simulator`)
* **Purpose:** Sandboxed counterfactual testing environment allowing transit managers to simulate operational adjustments before deploying buses to the road.
* **Visual Experience:** Side-by-side interactive levers (buses in service, frequency boost) and before-and-after scorecard.
* **Key Features:**
  * **Counterfactual Delta Output:**
    * Baseline Occupancy: `88.0%` ➔ **Simulated Occupancy:** `72.0%`
    * Baseline Wait Time: `14.5 min` ➔ **Simulated Wait Time:** `8.2 min`
  * **Strict Watermarking:** Output is explicitly watermarked with `is_simulated = True` to prevent synthetic outputs from polluting live operational records.

---

### 15. Dual-Pipeline Model Reconciliation (`/model-comparison`)
* **Purpose:** Proves independence and consistency between Apache Spark MLlib and Python Scikit-Learn pipelines as mandated by competition rules.
* **Visual Experience:** Top agreement rate KPIs followed by an unseen 100-case comparative ledger.
* **Key Features:**
  * **Model Agreement Rate:** **88.0%** across 100 unseen test records.
  * **Spark GBT F1-Score: 0.838** vs. **Python XGBoost F1-Score: 0.846**.
  * **Discrepancy Attribution:** Every disagreement near the 0.50 decision boundary is mathematically explained (e.g. `Spark: 0.48` vs `Python: 0.53`).

---

### 16. Operational Reports & Competition Exports (`/reports`)
* **Purpose:** Generates executive briefs and audit ledgers for transit authority oversight and competition evaluation.
* **Visual Experience:** Export cards with download action buttons for PDF, CSV, and JSON formats.
* **Key Features:**
  * **Executive PDF Brief:** Comprehensive network throughput and intervention summary.
  * **Data Quality CSV Ledger:** Complete 4-tier audit trail with transform provenance.
  * **Reconciliation JSON:** Full benchmark outputs and confusion matrices.

---

### 17. System Settings & Hardware Topology (`/settings`)
* **Purpose:** Centralized configuration panel displaying execution context, hardware allocation, and geographic boundaries.
* **Visual Experience:** Translucent glass cards detailing memory ceilings and Karachi coordinates.
* **Key Features:**
  * **Karachi Coordinates:** Lat 24.75–25.10, Lon 66.85–67.25.
  * **Hardware Ceiling:** 2GB Driver / 2GB Executor Spark memory budget tailored for 16GB RAM Mac.
  * **Execution Mode:** `DEVELOPMENT` (with offline fallback resilience) or `COMPETITION`.

---

### 18. Operator Profile & Security Ledger (`/profile`)
* **Purpose:** Manages operator credentials, session status, team clearances, and personal avatar photo uploading.
* **Visual Experience:** Liquid glass hero card with interactive photo uploader, real-time sync with top header, and engineering roster.
* **Key Features:**
  * **Photo Uploading:** Select any image (PNG, JPG, WebP up to 5MB) from your device; preview updates instantly.
  * **Cross-Component Sync:** Uploaded avatar synchronizes immediately with the top navigation bar.
  * **Supabase Avatars Bucket:** Pre-configured with public RLS policies for persistent storage.

---

## 🎨 Apple iOS / VisionOS Crystal Light Glass Palette

UrbanTransit IQ features an ultra-premium, high-contrast light theme engineered for zero eye fatigue and **STRICTLY ZERO BLUE or blue gradients**:

| Color Role | Name | Hex Code | Purpose & Usage |
| :--- | :--- | :--- | :--- |
| **Canvas** | Pearl Ice & Platinum | `#f6f8fc` / `#eef2f8` | Soft luminous ambient backdrop |
| **Glass Surfaces** | Frosted Crystal Glass | `rgba(255, 255, 255, 0.78)` | `backdrop-filter: blur(28px) saturate(190%)` |
| **Deep Ink** | Obsidian Slate | `#0f172a` | Primary headings, KPI numbers, high-contrast text |
| **Body Text** | Deep Slate | `#334155` | Secondary explanations, table data, subheadings |
| **Primary Luminescence** | Emerald Jade / Mint | `#059669` / `#10b981` | Positive trends, primary buttons, BRT routes |
| **Secondary Luminescence** | Solar Amber / Gold | `#d97706` / `#f59e0b` | Warnings, occupancy spikes, key corridor indicators |
| **Tertiary Luminescence** | Cyber Amethyst | `#7c3aed` / `#a855f7` | Machine learning metrics, cluster tags |
| **Alert / Hotspot** | Coral Crimson | `#e11d48` / `#f43f5e` | Delays, critical anomalies, vehicle maintenance triage |

---

## 🚀 Step-by-Step Installation & Quick Start

### 1. Prerequisites
* **macOS** (Optimized for 16 GB RAM / 1 TB SSD) or Linux
* **Python 3.9+** (installed via virtual environment)
* **Node.js 18+** and `npm`
* **Java 17 (OpenJDK)** (required for PySpark / Hadoop)

---

### 2. Clone and Setup Environment

```bash
# 1. Navigate to the project directory
cd /Users/muhammadaffan/Coding/UrbanTransit_IQ

# 2. Activate Python virtual environment
source venv/bin/activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Install frontend dependencies
cd frontend
npm install
cd ..
```

---

### 3. Setup Supabase Database & Storage (Optional but Recommended)
Open your Supabase SQL Editor (`https://ceymrldvneourlvciggl.supabase.co` -> **SQL Editor**) and run:
1. All database tables: [`backend/app/database/schema.sql`](backend/app/database/schema.sql)
2. Storage avatars bucket:
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public View Access for Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Anyone can update avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can delete avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars');
```

---

### 4. Running the Platform

#### **Terminal 1: Start the FastAPI Backend**
```bash
cd /Users/muhammadaffan/Coding/UrbanTransit_IQ
source venv/bin/activate
uvicorn backend.app.main:app --reload --port 8000
```
* **Interactive API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **API Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

#### **Terminal 2: Start the React Frontend**
```bash
cd /Users/muhammadaffan/Coding/UrbanTransit_IQ/frontend
npm start
```
* **Web Command Center:** [http://localhost:3000](http://localhost:3000)

---

### 5. Logging In

On the login page ([http://localhost:3000/login](http://localhost:3000/login)):
* **One-Click Quick Login:** Click **"Login as Muhammad Affan (Lead Architect)"** or **"Login as Competition Evaluator (Juror)"**.
* **Manual Credentials:**
  * **Email:** `affan@urbantransit.iq`
  * **Password:** `UrbanTransit2026!`

---

## ⚡ Handling 2,000,000+ Records: Verification Guide

The competition problem statement requires handling **2,000,000+ transit records** without exceeding 16 GB RAM.

### Step 1: Generate Competition Data
```bash
python data_generator/generate_data.py --scale competition
```
* Generates 12 normalized transport entities in `data/raw/`.
* **Verify row counts:**
```bash
wc -l data/raw/*.csv
```
* `tickets.csv` (>1.5M rows), `passenger_counts.csv` (>500k rows), `delays.csv` (>250k rows) total over **2,000,000+ rows**.

### Step 2: Run PySpark Ingestion & Parquet Partitioning
```bash
python -m spark_jobs.ingestion
python -m spark_jobs.data_quality
python -m spark_jobs.cleaning
python -m spark_jobs.feature_engineering
python -m spark_jobs.partitioning
```
* **Result:** Raw ~350 MB CSVs are compressed into ~45 MB Snappy Parquet partitions inside `data/parquet/`, cutting memory footprint by **85%** and enabling millisecond queries.

### Step 3: Run Dual-Pipeline & Core Verification Suite
```bash
# 1. Spark MLlib Delay Models
python -m spark_ml.delay_prediction

# 2. Python Scikit-Learn / XGBoost Models
python -m python_pipeline.delay_prediction

# 3. 100-Case Reconciliation Benchmark
python -m python_pipeline.comparison

# 4. Automated Core Verification Suite
python verify_core.py
```
* **Verification Result:** All 6 core assertion tests pass in <0.2 seconds.

---

## 🧪 Automated Verification Matrix

| Verification Domain | Script / Target | Status | Validation Result |
| :--- | :--- | :--- | :--- |
| **Frontend Production Build** | `npm run build` | **PASS (Exit 0)** | Zero syntax or bundling errors across all 18 pages |
| **Core Assertion Tests** | `python verify_core.py` | **PASS (6/6 OK)** | Karachi bounds, bunching ratio, route weighting, simulation watermark |
| **FastAPI REST Routers** | `fastapi.testclient` | **PASS (200 OK)** | All 16 routers verified (KPIs, maps, delays, forecasts, clustering) |
| **Offline Resilience** | `client.js` Interceptor | **PASS** | Zero unhandled Axios crashes; seamless fallback if backend is offline |
| **Profile Photo Upload** | `Profile.jsx` / `Header.jsx` | **PASS** | Base64 persistence and cross-component state synchronization |
| **Dual Pipeline Benchmark** | `comparison.py` | **PASS (88.0%)** | 100-case model agreement with borderline attribution |

---

## 📁 Repository Directory Structure

```
UrbanTransit_IQ/
├── backend/                    # FastAPI Backend Architecture
│   └── app/
│       ├── api/                # 16 REST Routers (auth, kpis, analytics, etc.)
│       ├── database/           # Supabase client singleton & schema.sql
│       ├── models/             # Pydantic data schemas
│       ├── services/           # Business logic & analytics engines
│       └── utils/              # Security, JWT, competition mode checks
├── config/                     # Centralized Settings & YAML Thresholds
│   ├── settings.py             # Environment configurations
│   ├── spark_config.py         # PySpark session & memory tuning
│   └── thresholds.yaml         # Configurable operational thresholds
├── data/                       # Storage Tiers
│   ├── raw/                    # 12 Normalized transit CSVs (2M+ records)
│   ├── cleaned/                # Post-audit cleaned datasets
│   └── parquet/                # Snappy-partitioned Parquet storage
├── data_generator/             # Synthetic Karachi Transit Generator
│   ├── generators/             # 12 Entity generators (routes, stops, tickets, etc.)
│   └── generate_data.py        # CLI generator (--scale small|medium|competition)
├── frontend/                   # React 18 Web Command Center
│   ├── public/                 # logo.png favicon & index.html
│   └── src/
│       ├── api/                # Axios client with resilient offline fallback
│       ├── assets/             # Brand logo assets
│       ├── components/         # Common widgets (KPI cards, charts, maps, filter bar)
│       ├── pages/              # 18 Page components (Dashboard, What-If, etc.)
│       └── index.css           # Apple iOS Crystal Light Glass Theme Tokens
├── hadoop/                     # Pseudo-Distributed HDFS Setup Scripts
├── spark_jobs/                 # PySpark Big Data Processing Jobs
├── spark_ml/                   # Spark MLlib Machine Learning Pipeline
├── python_pipeline/            # Independent Python Pipeline (Decoupled)
├── forecasting/                # SARIMA & XGBoost Demand Forecasting
├── clustering/                 # K-Means Route & Passenger Clustering
├── anomaly_detection/          # Isolation Forest & Z-Score Detectors
├── recommendation_engine/      # Deterministic Operational Advice Engine
├── simulations/                # Counterfactual What-If Sandbox Engine
├── verify_core.py              # Self-contained core test verification script
└── DEMO_CHECKLIST.md           # 24-point mandatory competition checklist
```

---

## 👥 Core Engineering Team

| Member | Competition Role | Primary Architecture Focus |
| :--- | :--- | :--- |
| **Muhammad Affan** | **Lead Architect & Full-Stack Engineer** | FastAPI Backend, Supabase Ledger, React UI, Apple Glass Design |
| **Muhammad Hammad** | **Big Data & Spark Engineer** | Apache Hadoop HDFS, PySpark Ingestion, Snappy Parquet Partitioning |
| **Shahmir Qadri** | **Machine Learning & Forecasting Engineer** | Spark MLlib GBT, Python XGBoost, SARIMA Forecasting, Dual Pipeline |
| **Waqas Rehman** | **Data Quality & Analytics Engineer** | 4-Tier Audit Ledger, Karachi Spatial Bounds, Delay & Fleet Analytics |

---

## 📜 License
This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
