-- Average delay by route
SELECT route_id, AVG(delay_minutes) as avg_delay,
       COUNT(*) as delay_count,
       MAX(delay_minutes) as max_delay,
       PERCENTILE_APPROX(delay_minutes, 0.5) as median_delay
FROM delays
WHERE delay_minutes > 0
GROUP BY route_id
ORDER BY avg_delay DESC;

-- Delay by hour and day
SELECT HOUR(scheduled_time) as hour, day_of_week,
       AVG(delay_minutes) as avg_delay,
       COUNT(*) as delay_count
FROM delays
GROUP BY HOUR(scheduled_time), day_of_week;

-- Delay cause distribution
SELECT delay_cause, COUNT(*) as count,
       AVG(delay_minutes) as avg_delay,
       ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM delays), 2) as pct
FROM delays
GROUP BY delay_cause
ORDER BY count DESC;

-- Stop-level delay bottlenecks
SELECT d.stop_id, s.stop_name, AVG(d.delay_minutes) as avg_delay,
       COUNT(*) as delay_events, s.latitude, s.longitude
FROM delays d JOIN stops s ON d.stop_id = s.stop_id
GROUP BY d.stop_id, s.stop_name, s.latitude, s.longitude
HAVING COUNT(*) > 10
ORDER BY avg_delay DESC;

-- Delay accumulation along route
SELECT d.route_id, rs.stop_sequence, s.stop_name,
       AVG(d.delay_minutes) as avg_delay
FROM delays d
JOIN route_stops rs ON d.route_id = rs.route_id AND d.stop_id = rs.stop_id
JOIN stops s ON d.stop_id = s.stop_id
GROUP BY d.route_id, rs.stop_sequence, s.stop_name
ORDER BY d.route_id, rs.stop_sequence;
