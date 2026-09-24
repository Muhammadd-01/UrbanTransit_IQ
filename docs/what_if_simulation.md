# UrbanTransit IQ — What-If Simulation Guide
Operational simulation engine in `simulations/what_if.py`.
- Allows modifying fleet size, capacity, frequency, headway, and passenger demand.
- Calculates projected occupancy shifts, crowding risk changes, and wait-time proxies.
- Every output is watermarked with `SIMULATED = True` to prevent historical conflation.
