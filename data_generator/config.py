SCALE_CONFIG = {
    'small': {
        'num_routes': 20,
        'num_stops': 100,
        'num_vehicles': 50,
        'num_passengers': 5000,
        'months': 3,
        'trips_per_route_per_day': 10,
    },
    'medium': {
        'num_routes': 50,
        'num_stops': 250,
        'num_vehicles': 100,
        'num_passengers': 20000,
        'months': 6,
        'trips_per_route_per_day': 15,
    },
    'competition': {
        'num_routes': 110,
        'num_stops': 520,
        'num_vehicles': 260,
        'num_passengers': 55000,
        'months': 12,
        'trips_per_route_per_day': 20,
    }
}

BOUNDS = {
    'lat_min': 24.75,
    'lat_max': 25.10,
    'lon_min': 66.85,
    'lon_max': 67.25
}
