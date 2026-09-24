"""
UrbanTransit IQ Comprehensive Test Runner.
Executes all unit, integration, ML, data quality, API, and SRS compliance test suites
using Python's built-in unittest runner.
"""

import sys
import unittest
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

def main():
    print("=" * 70)
    print("       UrbanTransit IQ — Comprehensive Automated Test Suite")
    print("=" * 70)

    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    # 1. Verification of core algorithms
    from verify_core import TestUrbanTransitIQCore
    suite.addTests(loader.loadTestsFromTestCase(TestUrbanTransitIQCore))

    # 2. SRS Compliance Suite
    from tests.test_compliance_srs import TestSRSCompliance
    suite.addTests(loader.loadTestsFromTestCase(TestSRSCompliance))

    # 3. Data Quality 15-Rule Engine Suite
    from tests.test_quality_15_rules_complete import TestDataQuality15Rules
    suite.addTests(loader.loadTestsFromTestCase(TestDataQuality15Rules))

    # 4. API Endpoints Complete Suite
    from tests.test_api_endpoints_complete import TestAPIEndpointsComplete
    suite.addTests(loader.loadTestsFromTestCase(TestAPIEndpointsComplete))

    # 5. Security & Auth Suite
    from tests.test_auth.test_security import (
        test_password_hashing, test_jwt_token_lifecycle
    )
    class TestSecurityUnit(unittest.TestCase):
        def test_pwd(self): test_password_hashing()
        def test_jwt(self): test_jwt_token_lifecycle()
    suite.addTests(loader.loadTestsFromTestCase(TestSecurityUnit))

    # 6. ML Model Evaluation Suite
    from tests.test_ml.test_models import (
        test_classifier_evaluation_metrics, test_regressor_evaluation_metrics
    )
    class TestMLEvalUnit(unittest.TestCase):
        def test_cls(self): test_classifier_evaluation_metrics()
        def test_reg(self): test_regressor_evaluation_metrics()
    suite.addTests(loader.loadTestsFromTestCase(TestMLEvalUnit))

    # 7. Dual Pipeline Independence Suite
    from tests.test_pipeline.test_dual_pipeline import (
        test_dual_pipeline_independence_rules, test_comparison_disagreement_analysis
    )
    class TestDualPipelineUnit(unittest.TestCase):
        def test_rules(self): test_dual_pipeline_independence_rules()
        def test_comp(self): test_comparison_disagreement_analysis()
    suite.addTests(loader.loadTestsFromTestCase(TestDualPipelineUnit))

    # 8. Forecasting Split Integrity Suite
    from tests.test_forecasting.test_forecast import test_chronological_split_integrity
    class TestForecastUnit(unittest.TestCase):
        def test_split(self): test_chronological_split_integrity()
    suite.addTests(loader.loadTestsFromTestCase(TestForecastUnit))

    # 9. Spark SQL queries and partitioning definitions
    from tests.test_spark.test_spark_pipeline import (
        test_spark_sql_files_exist, test_partitioning_script_configuration
    )
    class TestSparkUnit(unittest.TestCase):
        def test_sql(self): test_spark_sql_files_exist()
        def test_part(self): test_partitioning_script_configuration()
    suite.addTests(loader.loadTestsFromTestCase(TestSparkUnit))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    print("=" * 70)
    print(f"Total Tests Executed : {result.testsRun}")
    print(f"Passed               : {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failures             : {len(result.failures)}")
    print(f"Errors               : {len(result.errors)}")
    print("=" * 70)

    if result.wasSuccessful():
        print("ALL TESTS PASSED SUCCESSFULLY! FULL SRS COMPLIANCE VERIFIED.")
        sys.exit(0)
    else:
        print("SOME TESTS FAILED.")
        sys.exit(1)

if __name__ == "__main__":
    main()
