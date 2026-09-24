"""
Tests for transport data schemas, validation, and data quality engine.
"""

try:
    import pytest
except ImportError:
    pytest = None
from backend.app.schemas.analytics import FilterParams, KPIResponse
from backend.app.schemas.quality import DataQualityReport
from backend.app.utils.validators import (
    validate_coordinates,
    validate_passenger_count,
    validate_date_range,
)


def test_coordinate_validation():
    # Valid Karachi coordinates
    assert validate_coordinates(24.8607, 67.0011) is True
    assert validate_coordinates(24.9200, 67.1100) is True

    # Coordinates outside Karachi bounds
    assert validate_coordinates(31.5204, 74.3587) is False  # Lahore
    assert validate_coordinates(0.0, 0.0) is False


def test_passenger_count_validation():
    # Valid counts
    assert validate_passenger_count(45, 60) is True
    # Over capacity (allowed up to 150% in crowded conditions)
    assert validate_passenger_count(70, 60) is True
    # Negative count (invalid)
    assert validate_passenger_count(-5, 60) is False
    # Absurd count (>3x capacity)
    assert validate_passenger_count(300, 60) is False


def test_date_range_validation():
    assert validate_date_range("2024-01-01", "2024-01-31") is True
    assert validate_date_range("2024-02-01", "2024-01-01") is False


def test_kpi_response_schema():
    kpi = KPIResponse(
        total_passengers=125430,
        active_routes=25,
        active_vehicles=110,
        avg_occupancy=0.68,
        avg_delay=4.2,
        overcrowded_routes=3,
        underutilized_routes=2,
        demand_forecast=142000,
        anomaly_count=14,
    )
    assert kpi.total_passengers == 125430
    assert kpi.avg_occupancy == 0.68
