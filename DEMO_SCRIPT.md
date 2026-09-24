# UrbanTransit IQ — Competition Demonstration Script
**Step-by-Step Presentation Guide for Evaluators**

**Time Allocation:** 10–12 minutes  
**Presenter:** Team UrbanTransit IQ (Muhammad Affan, Muhammad Hammad, Shahmir Qadri, Waqas Rehman)  
**System Target:** UrbanTransit IQ TransitVerse Intelligence Platform  

---

## Act 1: Authentication & System Architecture (1.5 Minutes)

### Step 1.1: Launch and Login
1. Open browser to `http://localhost:3000/login`.
2. Enter evaluator credentials:
   * **Email:** `affan@urbantransit.iq`
   * **Password:** `UrbanTransit2026!`
3. Point out the badge in the top right: **Mode: DEVELOPMENT** (or **COMPETITION** when connected to live HDFS).
4. **Talking Point:** *"UrbanTransit IQ operates on dual execution modes. In competition mode, it connects directly to pseudo-distributed Hadoop HDFS and Apache Spark, maintaining complete architectural separation from our application database on Supabase."*

---

## Act 2: Big Data Generation, Ingestion & Data Quality (2.5 Minutes)

### Step 2.1: Data Management & Scale
1. Navigate to **Data Management** (`/data-management`).
2. Show the active dataset card: **Karachi Transit Network — 12 Relational Entities**.
3. Point out the generation controls:
   * Explain that `python data_generator/generate_data.py --scale competition` generates over 2,000,000 passenger movement records, 500,000 passenger counts, and 250,000 delay records across 110 routes in Karachi.
4. Highlight HDFS Integration: Show that raw files are uploaded to `/urbantransit/raw/` in HDFS.

### Step 2.2: The 4-Tier Data Quality Audit
1. Navigate to **Data Quality** (`/data-quality`).
2. Display the Data Quality Scorecard:
   * **Completeness:** ~96.8%
   * **Consistency:** ~98.2%
   * **Validity:** ~97.4%
   * **Overall Quality:** ~97.5%
3. Scroll to the **Record-Level Audit Viewer**:
   * Filter by status: `CORRECTED` (show negative passenger counts clamped to 0).
   * Filter by status: `FLAGGED` (show statistical delay outliers >3.0 z-scores).
   * Filter by status: `QUARANTINED` (show corrupted timestamps quarantined from model training).
4. **Talking Point:** *"We do not silently drop corrupt data. Every dirty record is tracked with its original value, cleaning rule, and audit state, ensuring complete regulatory traceability."*

---

## Act 3: Operational Analytics & Spatial Intelligence (2.5 Minutes)

### Step 3.1: Executive Dashboard & Karachi Transit Map
1. Navigate to **Dashboard** (`/`).
2. Point out the 9 dynamic KPI cards: Total Passengers, Active Routes, Active Vehicles, Average Occupancy, Average Delay, Overcrowded Routes, Underutilized Routes, Demand Forecast, Detected Anomalies.
3. Interact with the **Leaflet Transit Map of Karachi**:
   * Zoom into high-density transit corridors: Shahrah-e-Faisal, University Road, and M.A. Jinnah Road.
   * Click on a station marker to display real-time stop metrics (boarding volume, average delay).
4. Use the **Global Filter Bar**:
   * Select Route: `PB-01 (Peoples Bus: Model Colony to Tower)`.
   * Observe all dashboard charts update instantly via API.

### Step 3.2: Passenger Flow & OD Matrix
1. Navigate to **OD Analysis** (`/od-analysis`).
2. Display the Origin-Destination passenger matrix between Karachi's 10 major municipal zones.
3. Point out the primary transit corridor: **Zone 4 (Gulshan-e-Iqbal) → Zone 1 (Saddar)** exhibiting the heaviest morning commuter volume.

---

## Act 4: Machine Learning & Dual-Pipeline Verification (3.0 Minutes)

### Step 4.1: Delay Prediction & Severity Classification
1. Navigate to **Delay Analytics** (`/delay-analytics`).
2. Input parameters into the Interactive Prediction Widget:
   * Route: `PB-01`
   * Hour: `08:00 AM` (Peak Morning)
   * Historical Delay: `8.5 minutes`
   * Passenger Load: `58 passengers`
3. Click **Predict Delay Risk**:
   * Display prediction: **High Risk (Probability: 84.2%)**
   * Severity Classification: **Moderate Delay (5–10 minutes)**
   * Show Top Contributing Features: Passenger Load, Hour of Day, Historical Delay.

### Step 4.2: Model Comparison & The Dual-Pipeline Benchmark
1. Navigate to **Model Comparison** (`/model-comparison`).
2. Point out the Model Comparison Matrix:
   * Show evaluated models: Spark MLlib (GBT, RF, LR) vs. Python Pipeline (XGBoost, RF, LR).
   * Highlight test metrics: Python XGBoost (F1: 0.846) and Spark GBT (F1: 0.838).
3. Scroll to the **Dual-Pipeline 100-Case Evaluation**:
   * Show the **Agreement Rate (88.0%)** across 100 unseen test records.
   * Highlight a consistent prediction: Both Spark and Python correctly flag Case #42 as delayed.
   * Highlight a discrepancy: Show Case #87 where Python predicts `Minor Delay` (probability 0.51) while Spark predicts `On Time` (probability 0.48). Explain that the discrepancy is a minor borderline probability divergence, clearly explained by the system.
4. **Talking Point:** *"Both pipelines ingest the exact same raw data independently. Python never consumes Spark predictions. We hold both models accountable on unseen test cases."*

---

## Act 5: Decision Intelligence & What-If Simulation (2.0 Minutes)

### Step 5.1: Evidence-Based Recommendations
1. Navigate to **Recommendations** (`/recommendations`).
2. Show top algorithmic recommendations:
   * Example: *"Increase service frequency on Route PB-01 during 07:00–09:00 peak hours."*
   * Point out the supporting metrics: *Average occupancy 92.4%, 38% of trips overcrowded across 8 consecutive days.*
   * Expected Impact: *Reduces overcrowding by ~22%.*
3. **Talking Point:** *"Every recommendation is generated deterministically from calculated metrics. We do not use external generative AI APIs."*

### Step 5.2: What-If Simulation in Action
1. Navigate to **What-If Simulator** (`/what-if-simulator`).
2. Select Route: `PB-01`.
3. Adjust the levers:
   * Increase Vehicle Count: `+3 vehicles`
   * Increase Frequency: `+25%`
4. Click **Run Simulation**:
   * Display the comparison scorecard:
     * Current Occupancy: **92.4%** → Simulated Occupancy: **74.1%**
     * Overcrowding Risk: **High (38%)** → Simulated Risk: **Low (6%)**
     * Average Passenger Wait Time: **7.5 min** → Simulated Wait Time: **5.2 min**
   * Note the prominent **[SIMULATED]** badge on all output cards.

---

## Act 6: Conclusion & Evaluator Q&A
1. Navigate to **Reports** (`/reports`) and demonstrate the instant PDF/CSV analytical export.
2. Open the floor for evaluator questions and demonstrate configuration modifications in `config/thresholds.yaml`.
