-- Route-level KPIs
SELECT r.route_id, r.route_name, r.route_type,
       COUNT(DISTINCT t.trip_id) as total_trips,
       COUNT(DISTINCT tk.ticket_id) as total_passengers,
       AVG(pc.current_load * 1.0 / r.vehicle_capacity) as avg_occupancy_pct,
       SUM(CASE WHEN d.delay_minutes <= 2 THEN 1 ELSE 0 END) * 100.0 /
           NULLIF(COUNT(DISTINCT d.trip_id), 0) as on_time_pct
FROM routes r
LEFT JOIN trips t ON r.route_id = t.route_id
LEFT JOIN tickets tk ON t.trip_id = tk.trip_id
LEFT JOIN passenger_counts pc ON t.trip_id = pc.trip_id
LEFT JOIN delays d ON t.trip_id = d.trip_id
GROUP BY r.route_id, r.route_name, r.route_type;

-- Route utilization vs capacity
SELECT route_id,
       AVG(current_load) as avg_load,
       MAX(current_load) as max_load,
       AVG(vehicle_capacity) as capacity,
       AVG(current_load * 1.0 / vehicle_capacity) as utilization_pct
FROM passenger_counts pc
JOIN trips t ON pc.trip_id = t.trip_id
JOIN routes r ON t.route_id = r.route_id
GROUP BY route_id;
