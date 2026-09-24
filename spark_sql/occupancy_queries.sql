-- Occupancy distribution
SELECT CASE
         WHEN current_load * 1.0 / vehicle_capacity < 0.5 THEN 'Low'
         WHEN current_load * 1.0 / vehicle_capacity < 0.7 THEN 'Moderate'
         WHEN current_load * 1.0 / vehicle_capacity < 0.85 THEN 'High'
         WHEN current_load * 1.0 / vehicle_capacity < 0.95 THEN 'Overcrowded'
         ELSE 'Critical'
       END as occupancy_level,
       COUNT(*) as count
FROM passenger_counts
GROUP BY CASE
         WHEN current_load * 1.0 / vehicle_capacity < 0.5 THEN 'Low'
         WHEN current_load * 1.0 / vehicle_capacity < 0.7 THEN 'Moderate'
         WHEN current_load * 1.0 / vehicle_capacity < 0.85 THEN 'High'
         WHEN current_load * 1.0 / vehicle_capacity < 0.95 THEN 'Overcrowded'
         ELSE 'Critical'
       END;

-- Occupancy trend by hour
SELECT HOUR(timestamp) as hour,
       AVG(current_load * 1.0 / vehicle_capacity) as avg_occupancy_pct,
       MAX(current_load * 1.0 / vehicle_capacity) as max_occupancy_pct
FROM passenger_counts
GROUP BY HOUR(timestamp);
