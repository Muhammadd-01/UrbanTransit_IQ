"""
SRS Compliance Automated Test Suite.
Verifies all functional and non-functional requirements specified in UrbanTransit IQ SRS v1.0:
- Dataset Volume Compliance (Tickets >= 2M, Passenger Counts >= 500K, Delays >= 250K, Trips >= 50K, etc.)
- Model Performance Compliance (Accuracy >= 85%, F1 >= 0.80)
- Dual-Pipeline Agreement Compliance (Agreement >= 95.0%)
- Latency Benchmark Compliance (P95 < 5000ms for APIs, < 200ms for ML inference)
- Feature Engineering Completeness (All 25+ Transit Features)
"""

import os
import sys
import json
import unittest
from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

class TestSRSCompliance(unittest.TestCase):

    def setUp(self):
        self.raw_dir = PROJECT_ROOT / "data/raw"
        self.reports_dir = PROJECT_ROOT / "reports"
        self.models_dir = PROJECT_ROOT / "models/python"

    def test_01_dataset_volumes_meet_srs_thresholds(self):
        """Verify competition dataset meets or exceeds SRS Section 8 scale targets."""
        validation_file = self.reports_dir / "dataset_validation.json"
        self.assertTrue(validation_file.exists(), "dataset_validation.json must exist")
        
        with open(validation_file, "r") as f:
            v_data = json.load(f)
            
        counts = v_data.get("counts", {})
        self.assertGreaterEqual(counts.get("ticket_movements", 0), 2000000, "Tickets must be >= 2,000,000")
        self.assertGreaterEqual(counts.get("trip_passenger_records", 0), 500000, "Passenger counts must be >= 500,000")
        self.assertGreaterEqual(counts.get("delay_records", 0), 250000, "Delays must be >= 250,000")
        self.assertGreaterEqual(counts.get("trips", 0), 50000, "Trips must be >= 50,000")
        self.assertGreaterEqual(counts.get("routes", 0), 100, "Routes must be >= 100")
        self.assertGreaterEqual(counts.get("stops", 0), 500, "Stops must be >= 500")
        self.assertGreaterEqual(counts.get("vehicles", 0), 250, "Vehicles must be >= 250")
        self.assertGreaterEqual(counts.get("passengers", 0), 50000, "Passengers must be >= 50,000")
        self.assertGreaterEqual(counts.get("historical_months", 0), 12.0, "Historical span must be >= 12.0 months")
        self.assertEqual(v_data.get("status"), "PASSED", "Overall dataset validation status must be PASSED")
        self.assertTrue(v_data.get("all_passed"), "all_passed must be true")

    def test_02_model_performance_meets_srs_thresholds(self):
        """Verify ML delay prediction model meets accuracy >= 85% and F1 >= 0.80 (SRS Section 26)."""
        eval_csv = self.reports_dir / "model_evaluation.csv"
        self.assertTrue(eval_csv.exists(), "model_evaluation.csv must exist")
        
        df = pd.read_csv(eval_csv)
        self.assertIn("Model", df.columns)
        self.assertIn("Test accuracy", df.columns)
        self.assertIn("F1", df.columns)
        
        gbt = df[df["Model"].str.contains("Gradient Boosted Trees", case=False, na=False)]
        self.assertFalse(gbt.empty, "Gradient Boosted Trees must be evaluated")
        
        test_acc = float(gbt["Test accuracy"].iloc[0])
        f1 = float(gbt["F1"].iloc[0])
        
        self.assertGreaterEqual(test_acc, 0.85, f"Test accuracy ({test_acc}) must meet target >= 0.85")
        self.assertGreaterEqual(f1, 0.80, f"F1 score ({f1}) must meet target >= 0.80")

    def test_03_dual_pipeline_agreement_meets_target(self):
        """Verify Spark vs Python pipeline agreement meets >= 95% on test set (SRS Section 29)."""
        comp_csv = self.reports_dir / "pipeline_comparison.csv"
        self.assertTrue(comp_csv.exists(), "pipeline_comparison.csv must exist")
        
        df = pd.read_csv(comp_csv)
        agree_row = df[df["Metric"].str.contains("Agreement Rate", case=False, na=False)]
        self.assertFalse(agree_row.empty, "Agreement Rate row must exist in comparison CSV")
        
        val_str = str(agree_row["Spark MLlib"].iloc[0]).replace("%", "").strip()
        agree_val = float(val_str)
        self.assertGreaterEqual(agree_val, 95.0, f"Pipeline agreement ({agree_val}%) must be >= 95.0%")

    def test_04_latency_benchmarks_pass_srs_limits(self):
        """Verify non-functional latencies pass 5s requirement and 200ms ML requirement (SRS Section 40)."""
        perf_csv = self.reports_dir / "performance_benchmark.csv"
        self.assertTrue(perf_csv.exists(), "performance_benchmark.csv must exist")
        
        df = pd.read_csv(perf_csv)
        for _, row in df.iterrows():
            endpoint = row["Endpoint"]
            status = row["Compliance Status"]
            self.assertEqual(status, "PASS", f"Endpoint {endpoint} failed performance latency requirement")

    def test_05_feature_catalog_contains_25_features(self):
        """Verify feature engineering catalog contains all 25 transit features (SRS Section 25)."""
        catalog_md = PROJECT_ROOT / "docs/FEATURE_CATALOG.md"
        self.assertTrue(catalog_md.exists(), "docs/FEATURE_CATALOG.md must exist")
        content = catalog_md.read_text()
        
        required_features = [
            "passenger_count_trip", "passenger_count_route", "passenger_count_stop",
            "boarding_count", "alighting_count", "occupancy_ratio", "route_load_factor",
            "delay_minutes", "travel_time_minutes", "waiting_time_minutes", "route_utilization",
            "stop_utilization", "peak_indicator", "day_of_week", "weekend_indicator",
            "passenger_direction", "reliability_score", "punctuality_indicator", "delay_frequency",
            "schedule_deviation", "capacity_utilization", "demand_growth", "historical_average",
            "headway_minutes", "headway_variance", "bunching_indicator"
        ]
        for f in required_features:
            self.assertIn(f, content, f"Feature '{f}' must be documented in FEATURE_CATALOG.md")

    def test_06_15_rule_data_quality_report_exists(self):
        """Verify data quality ledger validates all 15 rules with 4-tier schema (SRS Section 15-20)."""
        dq_report = self.reports_dir / "data_quality_report.json"
        self.assertTrue(dq_report.exists(), "data_quality_report.json must exist")
        
        with open(dq_report, "r") as f:
            data = json.load(f)
            
        issues = data.get("issue_counts_by_type", {})
        self.assertEqual(len(issues), 15, "Must evaluate all 15 DQ rules in issue_counts_by_type")
        self.assertGreater(data.get("valid_records", 0), 0)
        self.assertGreater(data.get("corrected_records", 0), 0)
        self.assertGreater(data.get("quarantined_records", 0), 0)

if __name__ == "__main__":
    unittest.main()
