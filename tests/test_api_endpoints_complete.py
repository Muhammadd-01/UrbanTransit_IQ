"""
Comprehensive API Endpoint Integration Test Suite.
Validates all FastAPI routes for correct HTTP status codes, schemas,
query filtering, and response models.
"""

import sys
import unittest
from pathlib import Path
from fastapi.testclient import TestClient

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.main import app

class TestAPIEndpointsComplete(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_health_and_root(self):
        r1 = self.client.get("/health")
        self.assertEqual(r1.status_code, 200)
        self.assertEqual(r1.json()["status"], "ok")

        r2 = self.client.get("/")
        self.assertEqual(r2.status_code, 200)

    def test_02_dashboard_kpis(self):
        resp = self.client.get("/api/dashboard/kpis")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("total_passengers", data)
        self.assertIn("active_routes", data)
        self.assertIn("avg_occupancy", data)

    def test_03_quality_summary(self):
        resp = self.client.get("/api/quality/summary")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("valid_records", data)
        self.assertIn("issue_counts_by_type", data)

    def test_04_analytics_passenger_flow(self):
        resp = self.client.get("/api/analytics/passenger-flow", params={"route_id": "PB-01"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("total_volume", data)

    def test_05_analytics_od_matrix(self):
        resp = self.client.get("/api/analytics/od-matrix")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("matrix", data)
        self.assertIn("zones", data)

    def test_06_analytics_peak_hours(self):
        resp = self.client.get("/api/analytics/peak-hours")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("detected_peaks", data)

    def test_07_analytics_overcrowding(self):
        resp = self.client.get("/api/analytics/overcrowding")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("overcrowded_routes", data)

    def test_08_analytics_delays(self):
        resp = self.client.get("/api/analytics/delays")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("causes", data)

    def test_09_analytics_headway(self):
        resp = self.client.get("/api/analytics/headway")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("bunching_incidents_count", data)

    def test_10_analytics_route_performance(self):
        resp = self.client.get("/api/analytics/route-performance")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("route_scores", data)

    def test_11_predictions_delay(self):
        payload = {
            "route_id": "PB-01",
            "hour": 8,
            "day_of_week": 1,
            "historical_delay": 4.5,
            "passenger_load": 45.0,
            "num_stops": 20,
            "distance": 16.0,
            "is_peak": True,
            "vehicle_id": "BUS-0010"
        }
        resp = self.client.post("/api/predictions/delay", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("predicted_delay", data)
        self.assertIn("severity", data)
        self.assertIn("confidence", data)
        self.assertIn("contributing_features", data)

    def test_12_predictions_forecast_and_occupancy(self):
        r_fc = self.client.get("/api/predictions/forecast")
        self.assertEqual(r_fc.status_code, 200)
        data_fc = r_fc.json()
        self.assertEqual(data_fc["forecast_horizon_days"], 14)
        self.assertEqual(len(data_fc["projections"]), 14)

        r_occ = self.client.get("/api/predictions/occupancy")
        self.assertEqual(r_occ.status_code, 200)

    def test_13_recommendations_and_simulations(self):
        r_rec = self.client.get("/api/recommendations")
        self.assertEqual(r_rec.status_code, 200)
        recs = r_rec.json()
        self.assertIsInstance(recs, list)
        self.assertGreater(len(recs), 0)

        sim_payload = {
            "scenario_name": "Test Frequency Increase",
            "parameters": {"route_id": "PB-01", "vehicle_count_modifier": 2, "frequency_modifier": 20.0}
        }
        r_sim = self.client.post("/api/simulations/run", json=sim_payload)
        self.assertEqual(r_sim.status_code, 200)
        sim_data = r_sim.json()
        self.assertTrue(sim_data["is_simulated"])
        self.assertIn("results", sim_data)

    def test_14_comparison_dual_pipeline(self):
        resp = self.client.get("/api/comparison/dual-pipeline")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertGreaterEqual(data["agreement_rate"], 95.0)

if __name__ == "__main__":
    unittest.main()
