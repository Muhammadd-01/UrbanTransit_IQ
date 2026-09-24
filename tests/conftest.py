"""
Pytest fixtures and configuration for UrbanTransit IQ test suite.
"""

import os
import sys
from pathlib import Path
import pytest

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

# Set test environment variables
os.environ["EXECUTION_MODE"] = "DEVELOPMENT"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-12345678901234567890"
os.environ["SUPABASE_URL"] = "https://mock-supabase.supabase.co"
os.environ["SUPABASE_ANON_KEY"] = "mock-anon-key"
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "mock-service-role-key"


@pytest.fixture(scope="session")
def project_root():
    return PROJECT_ROOT


@pytest.fixture(scope="session")
def sample_raw_dir(project_root):
    return project_root / "data" / "raw"


@pytest.fixture
def mock_route_data():
    return {
        "route_id": "PB-01",
        "route_name": "Model Colony to Tower (Peoples Bus)",
        "route_type": "bus",
        "direction": "inbound",
        "total_distance_km": 28.5,
        "num_stops": 22,
        "avg_travel_time_minutes": 55.0,
        "vehicle_capacity": 60,
        "frequency_peak_minutes": 8,
        "frequency_offpeak_minutes": 15,
        "operating_hours_start": "06:00:00",
        "operating_hours_end": "22:00:00",
        "base_fare": 50.0,
    }


@pytest.fixture
def mock_trip_record():
    return {
        "trip_id": "TRP-001-20240101",
        "schedule_id": "SCH-PB01-01",
        "route_id": "PB-01",
        "vehicle_id": "VEH-101",
        "actual_departure": "2024-01-01T07:05:00",
        "actual_arrival": "2024-01-01T08:02:00",
        "direction": "inbound",
        "date": "2024-01-01",
        "status": "completed",
    }
