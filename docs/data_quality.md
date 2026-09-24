# UrbanTransit IQ — Data Quality & Audit Engine
Details the 4-tier audit system:
1. VALID: Records meeting all strict schema and geographic rules.
2. CORRECTED: Imputed or clamped records (e.g. negative passengers set to zero).
3. FLAGGED: Statistical anomalies exceeding 3.0 z-scores.
4. QUARANTINED: Fatal errors (corrupted IDs, timestamp inversion) excluded from ML.
