def validate_date_range(start, end):
    if start and end and start > end:
        raise ValueError("Start date must be before end date")

def validate_route_id(route_id: str):
    if not route_id:
        raise ValueError("Route ID cannot be empty")

def validate_coordinates(lat: float, lon: float):
    if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
        raise ValueError("Invalid coordinates")

def validate_passenger_count(count: int, capacity: int):
    if count < 0:
        raise ValueError("Passenger count cannot be negative")
    if count > capacity * 2:
        raise ValueError("Passenger count exceeds reasonable limit")
