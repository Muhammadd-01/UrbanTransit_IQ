
RULES = [
    {
        "name": "overcrowded_route",
        "condition": lambda metrics: metrics.get('avg_occupancy', 0) > 0.85,
        "template": "Increase service frequency on route {route_id} during {peak_period}",
        "category": "CAPACITY",
        "priority": 2
    },
    {
        "name": "underutilized_route",
        "condition": lambda metrics: metrics.get('avg_occupancy', 1) < 0.25,
        "template": "Review and potentially reduce frequency on route {route_id} during {time_period}",
        "category": "SCHEDULE",
        "priority": 4
    }
]
