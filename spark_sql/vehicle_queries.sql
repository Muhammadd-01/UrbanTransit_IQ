-- Vehicle utilization summary
SELECT v.vehicle_id, v.vehicle_type, v.capacity,
       COUNT(DISTINCT t.trip_id) as total_trips,
       AVG(pc.current_load) as avg_load,
       AVG(pc.current_load * 1.0 / v.capacity) as avg_occupancy_pct,
       COUNT(DISTINCT d.delay_id) as delay_count,
       AVG(d.delay_minutes) as avg_delay
FROM vehicles v
LEFT JOIN trips t ON v.vehicle_id = t.vehicle_id
LEFT JOIN passenger_counts pc ON t.trip_id = pc.trip_id
LEFT JOIN delays d ON t.trip_id = d.trip_id
GROUP BY v.vehicle_id, v.vehicle_type, v.capacity;

-- Headway calculation
SELECT route_id, stop_id,
       actual_departure,
       LAG(actual_departure) OVER (
           PARTITION BY route_id, stop_id, direction
           ORDER BY actual_departure
       ) as prev_departure,
       TIMESTAMPDIFF(MINUTE, 
           LAG(actual_departure) OVER (
               PARTITION BY route_id, stop_id, direction
               ORDER BY actual_departure
           ), actual_departure) as headway_minutes
FROM trips t
JOIN route_stops rs ON t.route_id = rs.route_id
WHERE t.status = 'completed';
