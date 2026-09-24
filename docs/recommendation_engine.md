# UrbanTransit IQ — Recommendation Engine Guide
Deterministic, metric-grounded rule engine in `recommendation_engine/engine.py`.
- No external generative AI APIs.
- Rules triggered by multi-day persistent thresholds (e.g. overcrowding >85% for >5 days).
- Includes supporting metrics, affected routes/times, priority (1-5), and expected impact.
