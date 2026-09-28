/**
 * UrbanTransit IQ: High-Fidelity Offline Mock & Fallback Data Ledger
 * Ensures 100% smooth UI operation even if backend server is offline or booting.
 */

export const mockKPIs = {
  total_passengers: 2148200,
  active_routes: 110,
  active_vehicles: 242,
  avg_occupancy: 0.74,
  avg_delay: 5.8,
  overcrowded_routes: 3,
  underutilized_routes: 2,
  demand_forecast: 2210000.0,
  anomaly_count: 18,
};

export const mockSummary = {
  peak_hour: '08:00 - 09:30 PKT',
  busiest_corridor: 'PB-01 (Model Colony to Tower)',
  fleet_health: '94.2% Operational',
  reconciliation_rate: '88.0% Agreement',
};

export const mockPassengerFlow = {
  hourly_inbound: [12000, 18000, 42000, 85000, 142000, 98000, 75000, 68000, 72000, 94000, 138000, 112000, 62000, 24000],
  hourly_outbound: [10000, 14000, 31000, 62000, 105000, 84000, 71000, 69000, 78000, 110000, 145000, 98000, 48000, 19000],
  hours: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
  total_daily_flow: 2148200,
};

export const mockODMatrix = {
  zones: ['Saddar', 'Clifton', 'Gulshan', 'Korangi', 'Nazimabad', 'Malir', 'SITE', 'Lyari'],
  matrix: [
    [1200, 4500, 6800, 5200, 4100, 3800, 4900, 2900],
    [3800, 980, 5100, 3900, 3200, 2800, 4100, 2100],
    [7100, 5400, 1400, 6200, 5800, 4900, 5300, 3100],
    [5900, 4100, 5800, 1100, 3900, 6400, 7200, 2800],
    [4800, 3400, 5600, 3800, 950, 3100, 4800, 2400],
    [4200, 3100, 5200, 6100, 3200, 890, 4600, 2000],
    [5400, 4300, 5900, 7100, 4900, 4500, 1300, 3500],
    [3200, 2400, 3400, 2900, 2500, 2100, 3600, 750],
  ],
  top_corridors: [
    { origin: 'Korangi', destination: 'SITE Industrial', volume: 7200, dominant_route: 'PB-08' },
    { origin: 'Gulshan-e-Iqbal', destination: 'Saddar CBD', volume: 7100, dominant_route: 'GL-01' },
    { origin: 'Malir', destination: 'Saddar CBD', volume: 6400, dominant_route: 'PB-01' },
    { origin: 'Gulshan-e-Iqbal', destination: 'Korangi', volume: 6200, dominant_route: 'PB-03' },
  ],
};

export const mockDelays = {
  delay_causes: [
    { cause: 'Traffic Congestion (MA Jinnah / Shahrah-e-Faisal)', percentage: 44, avg_delay_minutes: 14.2 },
    { cause: 'Intersection Queuing & Signal Delay', percentage: 22, avg_delay_minutes: 6.8 },
    { cause: 'Heavy Boarding & Alighting Surges', percentage: 18, avg_delay_minutes: 4.5 },
    { cause: 'Mechanical & Depot Delays', percentage: 10, avg_delay_minutes: 18.0 },
    { cause: 'Weather & Construction Rerouting', percentage: 6, avg_delay_minutes: 12.4 },
  ],
  avg_delay_by_hour: [2.1, 3.4, 7.8, 12.4, 6.2, 4.1, 3.8, 4.2, 5.1, 9.4, 14.1, 8.2, 4.0, 2.3],
};

export const mockRoutePerformance = [
  { route_id: 'GL-01', route_name: 'Green Line BRT (Surjani to Numaish)', composite_score: 94.2, status: 'EXCELLENT', components: { punctuality: 96, occupancy: 88, reliability: 98 } },
  { route_id: 'PB-01', route_name: 'Model Colony to Tower via Shahrah-e-Faisal', composite_score: 87.5, status: 'GOOD', components: { punctuality: 84, occupancy: 92, reliability: 89 } },
  { route_id: 'PB-08', route_name: 'Korangi Crossing to Tower via Defence', composite_score: 81.3, status: 'GOOD', components: { punctuality: 79, occupancy: 86, reliability: 82 } },
  { route_id: 'OR-01', route_name: 'Orange Line Metro (Orangi to Board Office)', composite_score: 89.0, status: 'GOOD', components: { punctuality: 91, occupancy: 78, reliability: 94 } },
  { route_id: 'LB-14', route_name: 'Hawksbay to Merewether Clock Tower', composite_score: 68.4, status: 'REQUIRES_ATTENTION', components: { punctuality: 62, occupancy: 74, reliability: 69 } },
];

export const mockVehicleUtilization = {
  active_fleet_count: 242,
  idle_fleet_count: 18,
  avg_daily_trips_per_vehicle: 8.6,
  fleet_utilization_rate: 0.89,
  maintenance_flagged_vehicles: [
    { vehicle_id: 'BUS-KHI-104', type: 'Electric 12m CityBus', age_years: 1.8, delay_count: 14, condition: 'CRITICAL' },
    { vehicle_id: 'BUS-KHI-078', type: 'CNG 18m Articulated', age_years: 3.2, delay_count: 11, condition: 'WARNING' },
    { vehicle_id: 'BUS-KHI-212', type: 'Hybrid 10m Feeder', age_years: 2.1, delay_count: 9, condition: 'WARNING' },
  ],
};

export const mockDualPipeline = {
  agreement_rate: 88.0,
  spark_f1: 0.838,
  python_f1: 0.846,
  cases: [
    { case_id: 'TEST-001', actual_result: 1, spark_result: 1, python_result: 1, spark_probability: 0.89, python_probability: 0.92, numerical_difference: 0.03, match_status: true, explanation: 'High congestion on MA Jinnah Rd; unanimous delay prediction.' },
    { case_id: 'TEST-002', actual_result: 0, spark_result: 0, python_result: 0, spark_probability: 0.12, python_probability: 0.15, numerical_difference: 0.03, match_status: true, explanation: 'Early morning off-peak window; unanimous on-time prediction.' },
    { case_id: 'TEST-003', actual_result: 1, spark_result: 0, python_result: 1, spark_probability: 0.48, python_probability: 0.53, numerical_difference: 0.05, match_status: false, explanation: 'Borderline threshold difference (0.48 vs 0.53) near decision boundary.' },
    { case_id: 'TEST-004', actual_result: 0, spark_result: 0, python_result: 0, spark_probability: 0.22, python_probability: 0.19, numerical_difference: 0.03, match_status: true, explanation: 'Dedicated BRT right-of-way prevents traffic interference.' },
  ],
};

export const mockDataQuality = {
  total_records: 10000000,
  clean_records: 1845000,
  corrected_records: 122000,
  flagged_records: 28000,
  quarantined_records: 5000,
  completeness_score: 98.4,
  validity_score: 99.1,
  consistency_score: 97.6,
  audits: [
    { id: 'AUD-8821', rule: 'KARACHI_BOUNDS_CHECK', field: 'latitude', status: 'CORRECTED', original: '31.5204', corrected: '24.8607', timestamp: '2026-09-23T10:14:22Z' },
    { id: 'AUD-8822', rule: 'NEGATIVE_OCCUPANCY', field: 'passenger_count', status: 'CORRECTED', original: '-4', corrected: '0', timestamp: '2026-09-23T10:14:25Z' },
    { id: 'AUD-8823', rule: 'DUPLICATE_TAP_EVENT', field: 'ticket_id', status: 'FLAGGED', original: 'TCK-9921', corrected: 'QUARANTINE_DEDUP', timestamp: '2026-09-23T10:15:02Z' },
  ],
};

export const mockForecast = {
  forecast_days: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Day 11', 'Day 12', 'Day 13', 'Day 14'],
  historical_actual: [2100000, 2120000, 2140000, 2090000, 1950000, 1720000, 2150000],
  projected_demand: [2160000, 2180000, 2195000, 2140000, 1980000, 1750000, 2210000],
  confidence_upper: [2240000, 2260000, 2280000, 2220000, 2050000, 1810000, 2300000],
  confidence_lower: [2080000, 2100000, 2110000, 2060000, 1910000, 1690000, 2120000],
  mape: 4.8,
  rmse: 42100,
};

export const mockClusters = [
  { name: 'Arterial Super-Corridors', description: 'Extremely high passenger throughput connecting major commercial hubs with persistent peak congestion.', centroid: { avg_demand: 142000, avg_occupancy: 0.91, punctuality: 82 }, members: ['PB-01', 'GL-01', 'PB-08'] },
  { name: 'Feeder & Coastal Lines', description: 'Moderate passenger volumes serving peripheral sub-metropolitan zones with regular travel times.', centroid: { avg_demand: 48000, avg_occupancy: 0.68, punctuality: 89 }, members: ['LB-14', 'PB-03', 'OR-01'] },
  { name: 'Industrial Commuter Shuttles', description: 'Bimodal demand peaks catering to industrial shift workers in Korangi and SITE.', centroid: { avg_demand: 76000, avg_occupancy: 0.84, punctuality: 76 }, members: ['IND-01', 'IND-04'] },
];

export const mockAnomalies = [
  { record_id: 'TEL-EV-90142', type: 'VEHICLE_BUNCHING', score: 0.94, explanation: 'Three consecutive PB-01 buses detected with under 2-minute headway near Nursery Shahrah-e-Faisal.' },
  { record_id: 'TEL-EV-90143', type: 'SUDDEN_OCCUPANCY_SURGE', score: 0.88, explanation: 'Unplanned 220% passenger load spike recorded at Numaish Chowrangi station due to stadium event.' },
  { record_id: 'TEL-EV-90144', type: 'COORDINATE_DRIFT', score: 0.82, explanation: 'Telemetry coordinates jumped 8.4 km outside designated route corridor polygon.' },
];

export const mockRecommendations = [
  { priority: 1, recommendation: 'Deploy 4 additional peak-hour buses on Route PB-01', reason: 'Persistent passenger overcrowding exceeding 92% capacity for 5 consecutive days.', expected_impact: 'Reduces wait times by 6.5 minutes and lowers occupancy to 76%', affected_route: 'PB-01 (Model Colony to Tower)', affected_time: '07:30 - 09:30 PKT', confidence_level: 'High (0.91)' },
  { priority: 2, recommendation: 'Synchronize Green Line BRT traffic signal priority at Gurumandir', reason: 'Average delay per transit vehicle increased by 8.4 minutes during evening peak.', expected_impact: 'Improves corridor punctuality by 14%', affected_route: 'GL-01', affected_time: '17:00 - 19:30 PKT', confidence_level: 'High (0.88)' },
];

export const mockDatasets = [
  { id: 'ds-01', name: 'Karachi Transit Core Ledger 2026', scale: 'COMPETITION', record_count: 10000000, status: 'READY', created_at: '2026-09-23T08:00:00Z' },
  { id: 'ds-02', name: 'Peoples Bus Telemetry Sample', scale: 'MEDIUM', record_count: 500000, status: 'READY', created_at: '2026-09-22T14:30:00Z' },
];
