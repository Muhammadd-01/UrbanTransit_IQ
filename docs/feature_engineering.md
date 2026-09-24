# UrbanTransit IQ — Feature Engineering Guide
Catalog of engineered transportation features:
- `occupancy_percentage`: `current_load / vehicle_capacity * 100`
- `delay_minutes`: Actual vs scheduled stop arrival time
- `headway`: Time gap between successive vehicles at same stop
- `bunching_indicator`: True when headway < 0.4x scheduled
- `delay_accumulation`: Cumulative delay propagation along route sequence
- `rolling_lag_1d`, `rolling_lag_7d`: Chronological demand lags
- `peak_indicator`: Binary flag for 07:00-10:00 and 17:00-20:00
