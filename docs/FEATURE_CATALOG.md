# UrbanTransit IQ — Feature Engineering Catalog

This catalog documents the complete set of engineered features used across Big Data (Spark) and Machine Learning (Python) pipelines in compliance with SRS Section 8.

---

## Feature Catalog Matrix

| Feature | Definition | Mathematical Formula | Source Columns | Pipeline | Data Type | Null Handling |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`passenger_count_trip`** | Total passenger load observed for a specific trip run | $\max(\text{current\_load})$ | `passenger_counts.current_load` | Spark & Python | `Float` | Median trip load (35.0) |
| **`passenger_count_route`** | Average passenger demand served per route | $\frac{1}{N}\sum \text{passenger\_count\_trip}$ | `routes.route_id`, `passenger_counts` | Spark & Python | `Float` | Route historical average |
| **`passenger_count_stop`** | Commuter throughput at specific transit stop | $\sum (\text{boarding} + \text{alighting})$ | `passenger_counts.boarding_count` | Spark & Python | `Integer` | 0 |
| **`boarding_count`** | Sum of passenger boardings along a trip run | $\sum \text{boarding\_count}$ | `passenger_counts.boarding_count` | Spark & Python | `Integer` | 0 |
| **`alighting_count`** | Sum of passenger alightings along a trip run | $\sum \text{alighting\_count}$ | `passenger_counts.alighting_count` | Spark & Python | `Integer` | 0 |
| **`occupancy_ratio`** | Ratio of onboard passenger load to vehicle capacity | $\frac{\text{passenger\_load}}{\text{vehicle\_capacity}}$ | `passenger_counts.current_load`, `vehicles.capacity` | Spark & Python | `Float` | Imputed route capacity |
| **`route_load_factor`** | Peak directional route occupancy ratio | $\max(\text{occupancy\_ratio}_{\text{peak}})$ | `occupancy_ratio`, `is_peak` | Spark & Python | `Float` | 0.74 (system average) |
| **`delay_minutes`** | Actual arrival deviation from scheduled timetable | $\text{actual\_time} - \text{scheduled\_time}$ | `delays.delay_minutes` | Spark & Python | `Float` | 0.0 (on-time) |
| **`travel_time_minutes`**| Total elapsed trip duration from origin to terminal | $\text{actual\_arrival} - \text{actual\_departure}$ | `trips.actual_departure`, `trips.actual_arrival` | Spark & Python | `Float` | $\text{distance} \times 2.5$ min/km |
| **`waiting_time_minutes`**| Estimated commuter platform wait time | $\frac{\text{Headway}}{2} + 0.3(\text{Delay})$ | `schedules`, `delays.delay_minutes` | Python | `Float` | 5.0m peak, 12.0m off-peak |
| **`route_utilization`** | Mean operational capacity utilization of a corridor | $\frac{\sum \text{Passenger-km}}{\text{Seat-km Available}}$ | `passenger_counts`, `routes.total_distance_km`| Spark & Python | `Float` | Historical mean |
| **`stop_utilization`** | Proportion of vehicle capacity exchanged at a stop | $\frac{\text{boarding} + \text{alighting}}{\text{vehicle\_capacity}}$ | `passenger_counts`, `vehicles.capacity` | Spark | `Float` | 0.0 |
| **`peak_indicator`** | Binary flag for commuter surge windows (7-9 & 17-19) | $\mathbb{I}(\text{hour} \in \{7,8,9,17,18,19\})$ | `trips.actual_departure` | Spark & Python | `Integer` | 0 (off-peak) |
| **`day_of_week`** | Day of the week integer (0=Monday ... 6=Sunday) | $\text{Date}.\text{weekday}()$ | `trips.date` | Spark & Python | `Integer` | Extracted from date |
| **`weekend_indicator`** | Pakistan transit weekend flag (Friday & Saturday) | $\mathbb{I}(\text{day\_of\_week} \in \{4, 5\})$ | `service_calendar.is_weekend` | Spark & Python | `Integer` | 0 (weekday) |
| **`passenger_direction`** | Trip movement orientation | $\text{inbound} \lor \text{outbound}$ | `routes.direction` | Spark & Python | `String` | 'inbound' |
| **`reliability_score`** | Schedule adherence metric scaled from 0.0 to 1.0 | $\max\left(0, 1 - \frac{\text{delay}}{30}\right)$ | `delays.delay_minutes` | Spark & Python | `Float` | 1.0 (perfect) |
| **`punctuality_indicator`**| Binary indicator of arrival within $\le 5$ minutes | $\mathbb{I}(\text{delay\_minutes} \le 5.0)$ | `delays.delay_minutes` | Spark & Python | `Integer` | 1 |
| **`delay_frequency`** | Proportion of trips experiencing delays $> 5$ min | $\frac{\sum \mathbb{I}(\text{delay} > 5)}{N_{\text{trips}}}$ | `delays.delay_minutes` | Spark & Python | `Float` | 0.0 |
| **`schedule_deviation`**| Algebraic deviation between actual and scheduled run | $\text{actual\_departure} - \text{scheduled\_departure}$ | `schedules`, `trips` | Spark & Python | `Float` | 0.0 |
| **`capacity_utilization`**| Clamped physical seat utilization factor | $\min(1.0, \text{occupancy\_ratio})$ | `occupancy_ratio` | Spark & Python | `Float` | 0.50 |
| **`demand_growth`** | Percentage increase over rolling baseline | $\frac{\text{Demand}_t - \text{Demand}_{t-7}}{\text{Demand}_{t-7}}$ | `passenger_counts.current_load` | Python | `Float` | 0.0 |
| **`historical_average`** | 14-day rolling mean passenger demand | $\frac{1}{14}\sum_{i=1}^{14} \text{Demand}_{t-i}$ | `trips.passenger_load` (shifted) | Python | `Float` | 35.0 (route average) |
| **`headway_minutes`** | Time spacing between consecutive vehicles on corridor | $T_{\text{vehicle}_i} - T_{\text{vehicle}_{i-1}}$ | `schedules.departure_time`, `delays` | Spark & Python | `Float` | 10.0m peak, 20.0m offpeak |
| **`headway_variance`** | Absolute deviation from scheduled headway spacing | $\| \text{Actual Headway} - \text{Scheduled Headway} \|$ | `schedules`, `trips` | Spark & Python | `Float` | 0.0 |
| **`bunching_indicator`**| Severe headway collapse flag ($< 0.4\times$ scheduled) | $\mathbb{I}\left(\frac{\text{Actual Headway}}{\text{Scheduled Headway}} < 0.40\right)$| `headway_minutes` | Spark & Python | `Integer` | 0 |
