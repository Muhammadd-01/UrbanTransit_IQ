"""
Tests for FastAPI API endpoints and status codes.
"""

try:
    import pytest
except ImportError:
    pytest = None
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "UrbanTransit IQ" in response.json()["info"]


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_settings_mode_endpoint():
    response = client.get("/api/settings/mode")
    assert response.status_code == 200
    assert "mode" in response.json()
    assert response.json()["mode"] in ["DEVELOPMENT", "COMPETITION"]


def test_settings_thresholds_endpoint():
    response = client.get("/api/settings/thresholds")
    assert response.status_code == 200
    data = response.json()
    assert "overcrowding" in data
    assert "delay" in data
    assert "route_performance" in data
