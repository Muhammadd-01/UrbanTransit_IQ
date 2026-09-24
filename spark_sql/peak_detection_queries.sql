-- Hourly passenger distribution for peak detection
SELECT HOUR(boarding_time) as hour,
       COUNT(*) as passenger_count,
       AVG(COUNT(*)) OVER () as daily_avg,
       STDDEV(COUNT(*)) OVER () as daily_stddev
FROM tickets t
JOIN trips tr ON t.trip_id = tr.trip_id
GROUP BY HOUR(boarding_time);

-- Route-specific hourly patterns
SELECT tr.route_id, HOUR(t.boarding_time) as hour,
       COUNT(*) as passenger_count
FROM tickets t JOIN trips tr ON t.trip_id = tr.trip_id
GROUP BY tr.route_id, HOUR(t.boarding_time)
ORDER BY tr.route_id, hour;

-- Weekday vs weekend comparison
SELECT sc.is_weekend, HOUR(t.boarding_time) as hour,
       COUNT(*) as passenger_count
FROM tickets t
JOIN trips tr ON t.trip_id = tr.trip_id
JOIN service_calendar sc ON tr.date = sc.date
GROUP BY sc.is_weekend, HOUR(t.boarding_time);
