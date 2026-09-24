"""
Tests for verifying dual-pipeline independence (Pipeline A: Spark vs Pipeline B: Python).
Verifies that Python does not consume Spark outputs, and tests comparison logic.
"""

import pytest
from python_pipeline.comparison import analyze_disagreement


def test_dual_pipeline_independence_rules():
    # Python pipeline scripts should not import pyspark or read from spark paths
    with open("python_pipeline/data_loader.py", "r") as f:
        content = f.read()
        assert "pyspark" not in content, "Pipeline B must not import PySpark!"
        assert "spark_ml" not in content, "Pipeline B must not import from spark_ml!"


def test_comparison_disagreement_analysis():
    # Test agreement case
    res1 = analyze_disagreement("On Time", "On Time", 0.02)
    assert res1["match_status"] is True
    assert res1["consistency_status"] == "consistent"

    # Test minor disagreement
    res2 = analyze_disagreement("Minor Delay", "On Time", 0.15)
    assert res2["match_status"] is False
    assert res2["consistency_status"] == "minor_disagreement"

    # Test major disagreement
    res3 = analyze_disagreement("Severe Delay", "On Time", 0.85)
    assert res3["match_status"] is False
    assert res3["consistency_status"] == "major_disagreement"
    assert "Disagreement" in res3["explanation"] or "divergence" in res3["explanation"].lower()
