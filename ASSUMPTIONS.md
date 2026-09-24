# UrbanTransit IQ — Assumptions

## Data Assumptions

1. **City Model**: The synthetic dataset models Karachi's public transit network. Geographic coordinates are within Karachi bounds (lat 24.75–25.10, lon 66.85–67.25).

2. **Weekend Definition**: Pakistan observes Friday and Saturday as weekend days. The `is_weekend` flag uses this convention (day_of_week 4=Friday, 5=Saturday).

3. **Peak Hours**: Peak hours are defined as 7–10 AM (morning) and 5–8 PM (evening) on weekdays. Weekend peaks differ and are detected statistically.

4. **Currency**: All fare values are in Pakistani Rupees (PKR).

5. **Time Zone**: All timestamps use Pakistan Standard Time (PKT, UTC+5).

6. **Data Completeness**: Real-world transit data has missing values, duplicates, and errors. The synthetic dataset intentionally includes ~2–5% missing values and ~1% duplicates to simulate reality.

7. **Passenger Behavior**: Passenger travel patterns (routes, times, frequency) are synthetically modeled based on typical commuter behavior in a large South Asian city. Actual individual behavior may differ.

8. **Vehicle Capacity**: Vehicle capacities are assumed constant during the analysis period. Real vehicles may have variable seating configurations.

9. **Delay Causes**: Delay cause categories (traffic, mechanical, weather, etc.) are assigned based on statistical distributions. Actual cause attribution in real systems may be more complex.

10. **GPS Events**: GPS events are simulated at 30–60 second intervals. Real GPS may have different reporting frequencies and signal quality issues.

## Technical Assumptions

1. **Hadoop Pseudo-Distributed**: For competition demonstration, Hadoop runs in pseudo-distributed mode (single node). This provides genuine HDFS functionality while running on a single machine.

2. **Spark Local Mode**: In DEVELOPMENT mode, Spark runs in local[*] mode. In COMPETITION mode, it can connect to a Spark cluster or continue in local mode with genuine HDFS.

3. **Memory Budget**: The system is designed for a 16 GB RAM Mac, with ~2 GB for HDFS, ~4 GB for Spark, ~1 GB for the backend, and ~0.5 GB for the frontend.

4. **Chronological Splits**: All ML train/validation/test splits are chronological (70/15/15 by date). This prevents data leakage from future data.

5. **Model Selection**: Model selection is based on validation set performance, not test set. Test metrics are reported for final evaluation only.

6. **Dual Pipeline Independence**: The Python pipeline loads raw CSV data independently and never consumes Spark-generated outputs. Both pipelines may produce different results — this is expected and compared.

7. **Supabase**: Application metadata is stored in Supabase (PostgreSQL). Supabase is NOT used as a replacement for HDFS/Spark processing — it only stores application-level metadata (users, jobs, model metadata, audit logs).

8. **Threshold Configuration**: All analytical thresholds (overcrowding, delay severity, anomaly detection) are configurable via `config/thresholds.yaml`. Default values are based on industry standards and can be adjusted by evaluators.

## Analytical Assumptions

1. **Occupancy Calculation**: Occupancy is calculated as `current_load / vehicle_capacity`. Values > 100% indicate standing passengers (up to ~120% is common in South Asian cities).

2. **Delay Definition**: A trip is considered "delayed" if actual time exceeds scheduled time by more than 2 minutes (configurable).

3. **Underutilization**: A service is considered underutilized if average occupancy is below 25% consistently (configurable).

4. **Overcrowding Persistence**: A route is classified as overcrowded only if >30% of its trips exceed 85% occupancy for >5 days. Single-trip overloads are flagged but not classified as "overcrowded route."

5. **Recommendation Confidence**: Recommendation confidence levels (HIGH/MEDIUM/LOW) are based on the amount of supporting evidence (number of affected trips, consistency of pattern, statistical significance).

6. **Simulation Estimates**: What-if simulation results are estimates based on simple capacity/demand models. They are clearly labeled as "SIMULATED" and should not be interpreted as precise predictions.

7. **Forecasting Horizon**: Default forecast horizon is 30 days. Accuracy decreases for longer horizons. MAPE is reported to quantify forecast uncertainty.
