# UrbanTransit IQ — Data Dictionary

## Transport Data Model

This document describes the complete 12-entity data model used by UrbanTransit IQ, modeled on Karachi's public transit network.

---

## Entity Relationship Overview

```
Passengers ──┐
             ├── Tickets ──── Trips ──── Schedules
             │                 │            │
             │                 ├── Delays   ├── Routes ──── Route_Stops ──── Stops
             │                 │            │
             │                 ├── GPS      ├── Vehicles
             │                 │
             │                 └── Passenger_Counts
             │
             └── Service_Calendar
```

---

## 1. Routes

| Column | Type | PK/FK | Description |
|--------|------|-------|-------------|
| route_id | VARCHAR(10) | PK | Unique route identifier (e.g., PB-01, GL-03) |
| route_name | VARCHAR(100) | | Human-readable route name |
| route_type | VARCHAR(20) | | bus / brt / metro / circular |
| direction | VARCHAR(10) | | inbound / outbound |
| total_distance_km | FLOAT | | Total route distance in kilometers |
| num_stops | INT | | Number of stops on route |
| avg_travel_time_minutes | FLOAT | | Average end-to-end travel time |
| vehicle_capacity | INT | | Capacity of vehicles assigned to this route |
| frequency_peak_minutes | INT | | Frequency during peak hours (minutes between vehicles) |
| frequency_offpeak_minutes | INT | | Frequency during off-peak hours |
| operating_hours_start | TIME | | First departure time |
| operating_hours_end | TIME | | Last departure time |
| base_fare | FLOAT | | Base fare in PKR |

---

## 2. Stops

| Column | Type | PK/FK | Description |
|--------|------|-------|-------------|
| stop_id | VARCHAR(10) | PK | Unique stop identifier |
| stop_name | VARCHAR(100) | | Stop name (Karachi area names) |
| latitude | FLOAT | | Geographic latitude (24.75–25.10) |
| longitude | FLOAT | | Geographic longitude (66.85–67.25) |
| zone | INT | | Zone number (1–10) |
| is_terminal | BOOLEAN | | Whether this is a terminal stop |
| is_interchange | BOOLEAN | | Whether routes interchange here |
| shelter_type | VARCHAR(20) | | covered / uncovered / none |
| accessibility | VARCHAR(20) | | full / partial / none |

---

## 3. Route_Stops

| Column | Type | PK/FK | Description |
|--------|------|-------|-------------|
| route_id | VARCHAR(10) | FK → Routes | Route this stop belongs to |
| stop_id | VARCHAR(10) | FK → Stops | Stop on this route |
| stop_sequence | INT | | Order of stop on route (1-based) |
| distance_from_origin_km | FLOAT | | Distance from first stop |
| estimated_travel_time_minutes | FLOAT | | Estimated time from origin |

**Composite PK**: (route_id, stop_id, stop_sequence)

---

## 4. Vehicles

| Column | Type | PK/FK | Description |
|--------|------|-------|-------------|
| vehicle_id | VARCHAR(10) | PK | Unique vehicle identifier |
| vehicle_type | VARCHAR(30) | | standard_bus / articulated_bus / brt_bus / metro_train / rail_coach |
| capacity | INT | | Maximum passenger capacity |
| year_manufactured | INT | | Year of manufacture |
| maintenance_status | VARCHAR(20) | | good / fair / needs_repair |
| fuel_type | VARCHAR(20) | | diesel / cng / electric |
| assigned_route_id | VARCHAR(10) | FK → Routes | Primary assigned route |

---

## 5. Service_Calendar

| Column | Type | PK/FK | Description |
|--------|------|-------|-------------|
| date | DATE | PK | Calendar date |
| day_of_week | INT | | 0=Monday ... 6=Sunday |
| day_name | VARCHAR(10) | | Monday, Tuesday, etc. |
| is_weekend | BOOLEAN | | True for Friday and Saturday (Pakistan) |
| is_holiday | BOOLEAN | | Public holiday flag |
| holiday_name | VARCHAR(50) | | Name of holiday if applicable |
| season | VARCHAR(20) | | summer / winter / monsoon / spring |
| special_event | VARCHAR(50) | | Special event name if applicable |
| temperature_high_c | FLOAT | | High temperature forecast |

---

## 6. Schedules

| Column | Type | PK/FK | Description |
|--------|------|-------|-------------|
| schedule_id | VARCHAR(15) | PK | Unique schedule identifier |
| route_id | VARCHAR(10) | FK → Routes | Route for this schedule |
| vehicle_id | VARCHAR(10) | FK → Vehicles | Assigned vehicle |
| departure_time | TIMESTAMP | | Scheduled departure time |
| arrival_time | TIMESTAMP | | Scheduled arrival time |
| direction | VARCHAR(10) | | inbound / outbound |
| service_date | DATE | FK → Service_Calendar | Date of service |
| is_active | BOOLEAN | | Whether schedule is active |

---

## 7. Trips

| Column | Type | PK/FK | Description |
|--------|------|-------|-------------|
| trip_id | VARCHAR(15) | PK | Unique trip identifier |
| schedule_id | VARCHAR(15) | FK → Schedules | Associated schedule |
| route_id | VARCHAR(10) | FK → Routes | Route |
| vehicle_id | VARCHAR(10) | FK → Vehicles | Vehicle used |
| actual_departure | TIMESTAMP | | Actual departure time |
| actual_arrival | TIMESTAMP | | Actual arrival time |
| direction | VARCHAR(10) | | inbound / outbound |
| date | DATE | | Trip date |
| status | VARCHAR(20) | | completed / cancelled / delayed / in_progress |

---

## 8. Passengers

| Column | Type | PK/FK | Description |
|--------|------|-------|-------------|
| passenger_id | VARCHAR(10) | PK | Unique passenger identifier |
| registration_date | DATE | | Date of registration |
| passenger_type | VARCHAR(20) | | regular / student / senior / tourist / corporate |
| home_zone | INT | | Home zone (1–10) |
| preferred_routes | VARCHAR(50) | | Comma-separated list of up to 3 route IDs |
| travel_frequency | VARCHAR(20) | | daily / frequent / occasional / rare |

---

## 9. Tickets

| Column | Type | PK/FK | Description |
|--------|------|-------|-------------|
| ticket_id | VARCHAR(15) | PK | Unique ticket identifier |
| passenger_id | VARCHAR(10) | FK → Passengers | Passenger who purchased |
| trip_id | VARCHAR(15) | FK → Trips | Trip taken |
| boarding_stop_id | VARCHAR(10) | FK → Stops | Boarding stop |
| alighting_stop_id | VARCHAR(10) | FK → Stops | Alighting stop |
| boarding_time | TIMESTAMP | | Boarding timestamp |
| alighting_time | TIMESTAMP | | Alighting timestamp |
| fare | FLOAT | | Fare paid (PKR) |
| ticket_type | VARCHAR(20) | | single / return / daily_pass / weekly_pass / monthly_pass |
| payment_method | VARCHAR(20) | | cash / card / mobile |

---

## 10. Passenger_Counts

| Column | Type | PK/FK | Description |
|--------|------|-------|-------------|
| count_id | VARCHAR(15) | PK | Unique count record identifier |
| trip_id | VARCHAR(15) | FK → Trips | Associated trip |
| stop_id | VARCHAR(10) | FK → Stops | Stop where count was taken |
| stop_sequence | INT | | Sequence position on route |
| boarding_count | INT | | Passengers boarding at this stop |
| alighting_count | INT | | Passengers alighting at this stop |
| current_load | INT | | Current passenger load after this stop |
| timestamp | TIMESTAMP | | Time of count |
| vehicle_capacity | INT | | Vehicle capacity (denormalized for analytics) |

---

## 11. Delays

| Column | Type | PK/FK | Description |
|--------|------|-------|-------------|
| delay_id | VARCHAR(15) | PK | Unique delay record identifier |
| trip_id | VARCHAR(15) | FK → Trips | Trip experiencing delay |
| stop_id | VARCHAR(10) | FK → Stops | Stop where delay occurred |
| route_id | VARCHAR(10) | FK → Routes | Route |
| vehicle_id | VARCHAR(10) | FK → Vehicles | Vehicle |
| scheduled_time | TIMESTAMP | | Originally scheduled time at stop |
| actual_time | TIMESTAMP | | Actual time at stop |
| delay_minutes | FLOAT | | Delay in minutes |
| delay_cause | VARCHAR(30) | | traffic / mechanical / passenger_load / weather / accident / signal / other |
| weather_condition | VARCHAR(20) | | clear / rain / heavy_rain / heat / fog |
| is_peak | BOOLEAN | | Whether delay occurred during peak hours |
| day_of_week | INT | | 0=Monday ... 6=Sunday |

---

## 12. GPS_Events

| Column | Type | PK/FK | Description |
|--------|------|-------|-------------|
| event_id | VARCHAR(15) | PK | Unique GPS event identifier |
| vehicle_id | VARCHAR(10) | FK → Vehicles | Vehicle being tracked |
| trip_id | VARCHAR(15) | FK → Trips | Associated trip |
| latitude | FLOAT | | GPS latitude |
| longitude | FLOAT | | GPS longitude |
| timestamp | TIMESTAMP | | GPS timestamp |
| speed_kmh | FLOAT | | Vehicle speed in km/h |
| heading_degrees | FLOAT | | Vehicle heading (0–360) |
| route_id | VARCHAR(10) | FK → Routes | Route being served |
| stop_proximity_meters | FLOAT | | Distance to nearest stop |

---

## Data Volume (Competition Scale)

| Entity | Approximate Records |
|--------|-------------------|
| Routes | 110 |
| Stops | 520 |
| Route_Stops | 2,200 |
| Vehicles | 260 |
| Service_Calendar | 365 |
| Schedules | 200,000 |
| Trips | 180,000 |
| Passengers | 55,000 |
| Tickets | 2,000,000+ |
| Passenger_Counts | 500,000+ |
| Delays | 250,000+ |
| GPS_Events | 1,000,000+ |
