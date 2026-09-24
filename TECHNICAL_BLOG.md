# Engineering UrbanTransit IQ: Building a Competition-Grade Transit Intelligence Platform with Apache Spark, HDFS, and Python

**By:** Muhammad Affan, Muhammad Hammad, Shahmir Qadri, Waqas Rehman  
**Published:** September 2026  
**Category:** Big Data Architecture, Machine Learning Engineering, Urban Analytics  
**Reading Time:** ~18 minutes (approx. 2,500 words)

---

## 1. Introduction: The Urban Transit Crisis in South Asian Megacities

Modern megacities across the developing world face mobility crises of staggering proportions. Few environments demonstrate this reality as acutely as Karachi, Pakistan. Home to over 17 million residents, Karachi serves as the financial engine of the nation, yet its transportation infrastructure has historically struggled to keep pace with rapid demographic expansion. On corridors such as Shahrah-e-Faisal, M.A. Jinnah Road, and University Road, hundreds of thousands of commuters navigate daily congestion characterized by unpredictable cascading delays, dangerous vehicle overcrowding, erratic headways, and vehicle bunching.

The recent introduction of formal mass transit systems—including the Green Line Bus Rapid Transit (BRT), the Orange Line Metro, and the modern Peoples Bus Service fleet—has initiated a paradigm shift. However, modern transit hardware without intelligent operational data systems yields sub-optimal outcomes. Transit authorities find themselves flooded with millions of raw telemetric data points: ticket taps, automated passenger counter (APC) logs, GPS breadcrumbs, and schedule discrepancies. Without a centralized, high-performance big data analytics engine, this deluge of raw numbers remains dormant.

UrbanTransit IQ was designed to bridge this divide. Developed as an end-to-end intelligence platform for the TransitVerse Intelligence competition, UrbanTransit IQ transforms raw transport telemetry into actionable operational decisions. This technical blog details our architectural journey, design trade-offs, engineering hurdles, and empirical findings while engineering a platform capable of handling millions of records using Apache Hadoop, HDFS, Apache Spark, Spark SQL, Spark MLlib, and an independent Python data science pipeline.

---

## 2. Architectural Vision: Dual Independent Pipelines

One of the most consequential decisions made during the architecture phase was the strict adherence to a **dual independent analytical pipeline**. In academic and hackathon settings, teams frequently commit an architectural anti-pattern: they either implement their entire processing in Python (using Pandas) and falsely claim big data capabilities, or they execute an initial query in Apache Spark, dump the predictions into a CSV, and have Python merely format the output.

UrbanTransit IQ enforces absolute architectural honesty. We created two separate pipelines that ingest the exact same underlying raw data:

1. **Pipeline A (Big Data & Distributed Computing):**
   * Raw Data Ingestion via Hadoop HDFS (`/urbantransit/raw/`)
   * Distributed Schema Validation & Data Quality Processing via PySpark
   * Distributed Aggregations & Relational Modeling via Spark SQL
   * Partitioned Storage via Snappy-compressed columnar Parquet files
   * Distributed Machine Learning via Spark MLlib (evaluating Logistic Regression, Random Forest Classifier, and Gradient-Boosted Trees)

2. **Pipeline B (Python Data Science & Specialized ML):**
   * Independent Data Loading from raw storage using vectorized Pandas
   * Independent Preprocessing, Outlier Detection, and Imputation
   * Domain-Specific Feature Engineering using NumPy and Scikit-learn
   * Machine Learning Modeling with Scikit-learn, XGBoost, and Statsmodels (SARIMA)

```
                       Same Underlying Raw Dataset
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
      Pipeline A                                        Pipeline B
  [ Apache Spark / HDFS ]                           [ Python Data Science ]
  • PySpark Ingestion                               • Pandas Vectorized Loading
  • Distributed Quality Check                       • Scikit-learn Feature Prep
  • Spark SQL Transformations                       • Scikit-learn / XGBoost
  • Spark MLlib Models                              • Statsmodels (SARIMA)
           │                                                 │
           └────────────────────────┬────────────────────────┘
                                    ▼
                      [ Dual Pipeline Comparison ]
                      • ≥100 Unseen Test Records
                      • Numerical Discrepancy Attribution
                      • Model Agreement Scoring
```

By maintaining two separate analytical engines, we achieve two major goals: first, we enable true fault tolerance and cross-pipeline validation, where anomalies in model convergence can be audited across different execution paradigms; second, we demonstrate how an enterprise transit authority can leverage distributed engines for massive nightly batch reconciliation while maintaining agile Python-based pipelines for exploratory ad-hoc intelligence.

---

## 3. The Data Engineering Journey: The 12-Entity Karachi Transit Model

Machine learning models are only as good as the underlying data representations. Because public transit authorities in emerging markets rarely release granular, unified telemetry due to proprietary and privacy constraints, competition requirements mandated that teams develop their own synthetic data generation systems.

Rather than generating naive random data, our team engineered a custom, multi-tier synthetic generator in `data_generator/` modeling Karachi's physical geography and human commuting rhythms across 12 distinct relational entities:
* **Routes (`routes.csv`):** 110 real and representative routes across Peoples Bus Service (PB-01 to PB-30), Green Line BRT (GL-01 to GL-05), Orange Line (OL-01 to OL-03), and local bus lines.
* **Stops (`stops.csv`):** 520 stops mapped strictly within Karachi's geographic coordinate envelope (lat: 24.75–25.10, lon: 66.85–67.25), spanning Saddar, Clifton, Gulshan-e-Iqbal, North Nazimabad, Malir, and Korangi.
* **Route Stops (`route_stops.csv`):** Geographically ordered sequences linking stops to routes with realistic cumulative distances and travel durations.
* **Vehicles (`vehicles.csv`):** Fleet inventory of standard buses, articulated BRT units, and metro trains with designated capacities, model years, and fuel configurations.
* **Service Calendar (`service_calendar.csv`):** Incorporating the local Friday-Saturday weekend structure and national holidays (Eid, Independence Day, Pakistan Day).
* **Schedules & Trips (`schedules.csv`, `trips.csv`):** Planned timetables cross-referenced against executed trips with variable delay distributions.
* **Passengers & Tickets (`passengers.csv`, `tickets.csv`):** Over 2,000,000 ticket transactions capturing commuter types (students, daily workers, seniors) and specific origin-destination pairs.
* **Passenger Counts (`passenger_counts.csv`):** Over 500,000 stop-level boarding, alighting, and vehicle load measurements.
* **Delays (`delays.csv`):** Over 250,000 delay events attributing root causes across traffic congestion, mechanical failure, severe weather, and signal bottlenecks.
* **GPS Events (`gps_events.csv`):** High-frequency spatial telemetry tracking coordinates, speed profiles, and vehicle proximity.

### Ingestion of Realistic Chaos: Noise & Hidden Patterns
Clean synthetic data produces deceptive machine learning metrics. To ensure true real-world resilience, our generator injects controlled operational defects:
* Missing values across non-essential fields (2–5%).
* Duplicate ticket transactions simulating sensor bounce (1%).
* Extreme delay spikes during monsoon seasons (July–August) and intense heatwaves.
* Coordinate drift placing occasional points slightly outside operational bounding boxes.
* Vehicle bunching conditions where two consecutive buses on the same corridor end up separated by less than 40% of their scheduled headway.
* **Hidden-Data Scenarios:** New routes, unmapped transfer stations, and novel commuting spikes added exclusively to the final testing period to evaluate pipeline adaptability.

---

## 4. Big Data Infrastructure: Spark and HDFS on a 16 GB Workstation

A central challenge of this project was operationalizing a genuine big data stack on development hardware constrained to **16 GB RAM and 1 TB SSD**. 

Industry documentation frequently suggests that Apache Hadoop requires multi-node clusters with 32 GB to 64 GB of RAM per node. However, by fine-tuning Java Virtual Machine (JVM) heap limits and Hadoop configuration XML files, we successfully configured a fully functional **single-node pseudo-distributed Hadoop cluster**:

```xml
<!-- hdfs-site.xml: Tailored for 16GB Single-Node Operation -->
<configuration>
    <property>
        <name>dfs.replication</name>
        <value>1</value>
    </property>
    <property>
        <name>dfs.blocksize</name>
        <value>67108864</value> <!-- 64 MB Block Size -->
    </property>
    <property>
        <name>dfs.namenode.handler.count</name>
        <value>10</value>
    </property>
</configuration>
```

For Apache Spark, we configured standalone execution tuned to match the host hardware budget:
* **Spark Driver Memory:** 2 GB (`spark.driver.memory = 2g`)
* **Spark Executor Memory:** 2 GB (`spark.executor.memory = 2g`)
* **Shuffle Partitions:** 8 partitions (`spark.sql.shuffle.partitions = 8`) to eliminate excessive task serialization overhead on small-to-medium cores.
* **Storage Strategy:** Columnar Parquet format with snappy compression, partitioned by `(year, month, route_id)`.

This memory allocation reserves approximately 2 GB for HDFS NameNode/DataNode daemons, 4 GB for Spark workers, 1 GB for the FastAPI backend, and 0.5 GB for the React frontend, leaving a comfortable 4.5 GB operating system buffer. The system can execute end-to-end data ingestion, validation, and MLlib model training on over 2,000,000 rows without experiencing OutOfMemory (OOM) exceptions or JVM heap thrashing.

---

## 5. Data Quality as a First-Class Citizen: The 4-Tier Audit Engine

In enterprise data pipelines, data cleaning cannot be a silent, destructive operation. If a row with a negative passenger count is silently dropped or transformed, analysts lose visibility into potential hardware malfunctions in Automated Passenger Counter (APC) sensors.

UrbanTransit IQ implements an auditable, four-tier Data Quality Engine (`backend/app/analytics/data_quality.py` and `spark_jobs/data_quality.py`). Every row evaluated by the system receives an explicit audit status:
1. `VALID`: The record satisfies all primary key, foreign key, geographic boundary, and physical plausibility constraints.
2. `CORRECTED`: Non-fatal anomalies repaired via deterministic imputation rules (e.g., negative passenger boarding clamped to zero; missing vehicle capacity populated via route fleet metadata).
3. `FLAGGED`: Suspicious records that warrant operational investigation but remain statistically usable (e.g., delays exceeding 3 standard deviations during clear weather conditions).
4. `QUARANTINED`: Irreparable records (e.g., corrupt primary keys, timestamp inversion where arrival precedes departure by hours, or broken foreign keys referencing non-existent trips) that are partitioned into quarantine tables and excluded from ML feature sets.

Every remediation action is recorded with the original value, cleaning rule, corrected value, and timestamp, generating a real-time Data Quality Report visible directly in the analytics dashboard.

---

## 6. Feature Engineering for Transportation Dynamics

Transforming tabular timestamps and counts into predictive signals requires deep domain knowledge of urban transit mechanics. Our feature engineering pipeline computes a rich set of transport-specific metrics:

1. **Occupancy Ratio & Overcrowding Factor:**
   $$\text{occupancy\_percentage} = \frac{\text{current\_load}}{\text{vehicle\_capacity}} \times 100$$
   Trips are categorized into five operational bands: *Low* (<50%), *Moderate* (50–70%), *High* (70–85%), *Overcrowded* (85–95%), and *Critical* (>95%).

2. **Headway Regularity & Bunching Index:**
   The temporal headway between vehicle $i$ and vehicle $i-1$ at stop $s$:
   $$H_i = t_{\text{arr}, i} - t_{\text{arr}, i-1}$$
   When $H_i < 0.4 \times H_{\text{scheduled}}$, the trip is flagged for **Vehicle Bunching**. When $H_i > 2.0 \times H_{\text{scheduled}}$, a **Service Gap** is registered.

3. **Cumulative Delay Propagation:**
   Rather than treating delays as isolated events, we calculate delay accumulation along route sequences:
   $$\Delta_{\text{propagation}} = \text{delay}_{\text{stop } k} - \text{delay}_{\text{stop } 1}$$
   This isolates specific spatial bottleneck intersections where delays compound exponentially.

4. **Temporal Lag Signals:**
   To forecast demand without data leakage, we compute chronological rolling windows: 1-day lag, 7-day seasonal lag, and 30-day moving averages for both passenger demand and delay rates.

---

## 7. Machine Learning Modeling & Dual-Pipeline Verification

A core tenet of our implementation is empirical rigor: **we never claim a model is superior without measured validation evidence, and we never hard-code metrics**.

In both Pipeline A (Spark MLlib) and Pipeline B (Python / Scikit-learn / XGBoost), we formulated delay prediction as a supervised binary classification task: predicting whether a scheduled trip will experience an operational delay exceeding 5 minutes.

### 7.1 Evaluated Algorithms

| Pipeline | Candidate Model | Hyperparameter Configuration | Test F1-Score | Test ROC-AUC | Inference Latency |
|----------|----------------|------------------------------|:-------------:|:------------:|:-----------------:|
| **Spark MLlib** | Logistic Regression | `maxIter=100`, `regParam=0.01` | 0.742 | 0.801 | 1.8 ms/rec |
| **Spark MLlib** | Random Forest | `numTrees=100`, `maxDepth=10` | 0.819 | 0.876 | 4.2 ms/rec |
| **Spark MLlib** | GBT Classifier | `maxIter=50`, `maxDepth=8` | **0.838** | **0.894** | 5.6 ms/rec |
| **Python ML** | Logistic Regression | `C=1.0`, `solver='lbfgs'` | 0.738 | 0.798 | 0.4 ms/rec |
| **Python ML** | Random Forest | `n_estimators=100`, `max_depth=10` | 0.822 | 0.880 | 1.2 ms/rec |
| **Python ML** | XGBoost Classifier | `n_estimators=100`, `learning_rate=0.1` | **0.846** | **0.902** | 0.9 ms/rec |

Both pipelines demonstrated strong predictive power. Gradient-boosted ensembles (GBT in Spark, XGBoost in Python) consistently outperformed linear baselines, demonstrating the non-linear relationship between passenger loads, temporal indicators, and congestion propagation.

### 7.2 The Dual-Pipeline 100-Case Evaluation
To satisfy the competition's dual-pipeline verification requirement, we built an automated reconciliation service (`python_pipeline/comparison.py`). The service extracts at least 100 unseen test records and passes them through both trained pipelines simultaneously. 

For every record, it records:
* The ground truth delay status.
* The Spark MLlib prediction and probability.
* The Python XGBoost prediction and probability.
* Absolute numerical divergence ($|\hat{P}_{\text{Spark}} - \hat{P}_{\text{Python}}|$).
* Consistency status (`consistent`, `minor_disagreement`, `major_disagreement`).

In our benchmark evaluation across 100 unseen cases, the pipelines achieved an **88.0% exact classification agreement rate**. For the 12 cases where predictions diverged, the automated attribution engine identified that all 12 cases were borderline instances where the predicted delay probabilities hovered within the 0.46–0.54 threshold range. This transparency gives transit dispatchers nuanced confidence rather than deceptive certainty.

---

## 8. Time-Series Forecasting: Defeating Data Leakage

Time-series forecasting in public transportation often falls victim to a critical methodological flaw: random train/test splitting. In standard cross-validation, randomly shuffling rows allows historical models to "peek" into future observations, producing artificially inflated $R^2$ scores that collapse when deployed into real-world production.

In UrbanTransit IQ, we strictly mandate **chronological time-series boundaries**:
* **Training Window:** The first 70% of chronological time (Months 1 through 8).
* **Validation Window:** The subsequent 15% (Months 9 and 10) for hyperparameter tuning.
* **Test Window:** The final 15% (Months 11 and 12) reserved strictly for out-of-sample evaluation.

```
┌───────────────────────────────────────────────┬──────────────────────┬──────────────────────┐
│             Training Window (70%)             │   Validation (15%)   │      Test (15%)      │
│               Months 1 to 8                   │    Months 9 & 10     │    Months 11 & 12    │
└───────────────────────────────────────────────┴──────────────────────┴──────────────────────┘
 2024-01-01                                                                         2024-12-31
```

Using this chronological framework, we deployed a hybrid forecasting methodology:
1. **SARIMA (Seasonal Autoregressive Integrated Moving Average):** Captures weekly cyclicality ($s=7$) across route-level aggregates.
2. **Lagged XGBoost Regressor:** Utilizes 1-day, 7-day, and 14-day demand lags alongside temperature and holiday indicators to forecast daily ridership for each of the 110 routes.

On the unseen 60-day test horizon, our XGBoost demand forecaster achieved a **Mean Absolute Percentage Error (MAPE) of 6.8%** and a **Root Mean Square Error (RMSE) of 142 passengers/day**, outperforming naive seasonal baselines by over 34%.

---

## 9. Decision Intelligence: Algorithmic Recommendations & What-If Simulation

Data science platforms frequently fail at the final mile: converting analytics into actionable operational interventions. UrbanTransit IQ addresses this through two specialized decision-support modules:

### 9.1 The Evidence-Based Recommendation Engine
Our recommendation engine (`recommendation_engine/engine.py`) explicitly rejects external generative AI text APIs in favor of a **deterministic, rule-driven expert system**. Every recommendation emitted by the platform is tied directly to computed metrics:
* **Persistent Overcrowding Rule:** If a route experiences $>85\%$ occupancy on $>30\%$ of its trips during morning peak hours for $>5$ consecutive days, the engine emits a High-Priority recommendation: *"Increase service frequency on Route PB-01 during 07:00–09:00 peak window."* The recommendation provides exact supporting evidence, affected vehicle IDs, and an estimated crowd reduction percentage.
* **Bottleneck Mitigation Rule:** If a specific stop registers an average delay $>10$ minutes across $>20$ separate trips, the engine flags the location as a spatial bottleneck, calculating the net network delay savings achievable through schedule re-timing.

### 9.2 The Interactive What-If Simulator
Transit planners often ask: *"What happens if we reallocate 4 buses from underutilized Route LB-14 to overcrowded Corridor PB-01?"*

The What-If Simulation engine (`simulations/what_if.py`) allows operators to interactively modulate operational levers:
* Number of active vehicles ($\pm N$)
* Vehicle seating/standing capacity ($\pm \%$)
* Departure frequency ($\pm \%$)
* Scheduled headway spacing ($\pm \text{minutes}$)
* Passenger demand surge factors ($\pm \%$)

The engine calculates revised passenger wait-time proxies (based on revised headway distributions), projected occupancy shifts, and overcrowding risk probabilities. Crucially, the UI permanently brands all simulation results with an unmistakable **SIMULATED** badge, ensuring that simulated projections are never conflated with observed historical reality.

---

## 10. The User Interface: Operational Clarity with React, Plotly, and Leaflet

A high-performance backend requires an equally thoughtful user interface. Built with **React 18**, **Plotly.js**, and **Leaflet**, the UrbanTransit IQ frontend delivers a responsive dashboard with 17 dedicated views:

1. **Executive Dashboard:** High-level KPI scorecards (Total Passengers, Active Vehicles, Fleet Utilization, Average Network Delay, Overcrowded Routes, Detected Anomalies) backed by real-time API aggregations.
2. **Interactive Geographic Transit Map:** Built on Leaflet, centering on Karachi's transit footprint with customizable layers displaying route alignments, stop clusters, delay heatmaps, and bottleneck pins.
3. **Origin-Destination (OD) Matrix:** High-density Plotly heatmaps detailing passenger exchange volumes between Karachi's 10 major municipal zones.
4. **Model Comparison & Dual-Pipeline Verification:** Visual confusion matrices, ROC curves, and side-by-side Spark vs. Python performance tables.
5. **Global Multi-Filter Bar:** A persistent top filter allowing dispatchers to dynamically slice the entire platform by date range, route identifier, direction, day of week, hour of day, and peak/off-peak classification.

The visual theme adheres to modern ergonomics: a deep slate sidebar (`#1a1a2e`), crisp clean data containers (`#ffffff`), subtle shadows, and purposeful chromatic accents (emerald for punctuality, amber for warning thresholds, crimson for critical bottlenecks).

---

## 11. Conclusion & Key Takeaways

Building UrbanTransit IQ was an intensive exercise in full-stack data engineering, distributed systems, and applied machine learning. The project validated several core engineering insights:
1. **Big Data Tools are Practical on Standard Hardware:** With disciplined configuration (64 MB HDFS blocks, tuned JVM heaps, Kryo serialization), genuine Apache Hadoop and PySpark can be run successfully on 16 GB workstations.
2. **Dual Pipelines Elevate Operational Trust:** Comparing an enterprise Spark pipeline against an independent Python data science pipeline provides unmatched validation rigor that eliminates silent modeling bugs.
3. **Data Quality Must Be Quantified, Not Hidden:** A four-tier audit system (Valid, Corrected, Flagged, Quarantined) transforms data cleaning from an ad-hoc script into an auditable intelligence asset.
4. **Actionable Intelligence Outweighs Black-Box Complexity:** Explainable, metric-backed recommendations and what-if simulations provide vastly more value to transit authorities than opaque, ungrounded generative AI predictions.

As Karachi continues its transit modernization, platforms like UrbanTransit IQ offer a blueprint for data-driven, equitable, and efficient urban mobility.

---

### Acknowledgments
Developed for the **TransitVerse Intelligence Competition — Data Science Intelligence Arena** by Muhammad Affan, Muhammad Hammad, Shahmir Qadri, and Waqas Rehman.
