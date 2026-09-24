"""
Recommendation Engine Rules (SRS Section 30).
Defines actionable transit operational rules across capacity, scheduling,
fleet reallocation, and headway regularisation.
"""

from typing import Dict, Any, List

RULES = [
    {
        "id": "RULE-CAP-01",
        "name": "severe_overcrowding",
        "category": "CAPACITY",
        "priority": 1,
        "condition": lambda m: m.get("avg_occupancy", 0) >= 0.85 or m.get("overcrowded_trips_pct", 0) >= 25.0,
        "template": "Increase peak service frequency on route {route_id} during {peak_period}",
        "reason_template": "Route consistently exceeds 85% occupancy threshold (observed: {avg_occupancy:.1%}) with {overcrowded_trips_pct:.1f}% overcrowded trips.",
        "impact_template": "Adding {additional_trips} trips/hour is projected to lower occupancy to {target_occupancy:.1%} and reduce platform wait time by {wait_reduction:.1f} mins.",
        "confidence": "HIGH"
    },
    {
        "id": "RULE-SCHED-02",
        "name": "headway_bunching",
        "category": "SCHEDULE",
        "priority": 2,
        "condition": lambda m: m.get("regularity_index", 1.0) < 0.65 or m.get("bunching_events", 0) >= 5,
        "template": "Enforce headway holding control and departure spacing at origin terminal for route {route_id}",
        "reason_template": "Headway regularity index deteriorated to {regularity_index:.2f} with {bunching_events} bunching incidents (<0.4x scheduled headway).",
        "impact_template": "Prevents bus pairing, restores regular passenger arrivals, and reduces downstream wait time variability by ~35%.",
        "confidence": "HIGH"
    },
    {
        "id": "RULE-FLEET-03",
        "name": "underutilized_reallocation",
        "category": "FLEET_OPTIMIZATION",
        "priority": 3,
        "condition": lambda m: m.get("avg_occupancy", 1.0) < 0.30 and m.get("daily_trips", 0) >= 6,
        "template": "Reallocate surplus fleet capacity from low-demand route {route_id} to overcrowded trunk corridors",
        "reason_template": "Route operates with sustained off-peak occupancy of only {avg_occupancy:.1%}, representing surplus fleet capacity.",
        "impact_template": "Reallocating {surplus_buses} vehicles can address critical deficits on high-density routes without degrading service headway.",
        "confidence": "MEDIUM"
    },
    {
        "id": "RULE-DELAY-04",
        "name": "chronic_congestion_delay",
        "category": "ROUTE",
        "priority": 2,
        "condition": lambda m: m.get("avg_delay_min", 0) >= 7.0 or m.get("delayed_trips_pct", 0) >= 30.0,
        "template": "Deploy express short-turn service and adjust schedule padding on corridor {route_id}",
        "reason_template": "Average trip delay is {avg_delay_min:.1f} mins with {delayed_trips_pct:.1f}% delayed trips due to recurrent corridor congestion.",
        "impact_template": "Express skip-stop pattern would bypass peak bottlenecks, reducing end-to-end travel time by ~18%.",
        "confidence": "HIGH"
    },
    {
        "id": "RULE-FARE-05",
        "name": "peak_demand_spreading",
        "category": "FARE",
        "priority": 4,
        "condition": lambda m: m.get("peak_to_base_ratio", 1.0) >= 2.2,
        "template": "Implement off-peak fare differential (-15% discount) to incentivize peak spreading on route {route_id}",
        "reason_template": "Extreme peak-to-base ratio of {peak_to_base_ratio:.2f} creates unmanageable surges during peak hours.",
        "impact_template": "Shifts approximately 8-12% of discretionary travel to shoulder hours, flattening peak crowding curves.",
        "confidence": "MEDIUM"
    }
]
