-- Hourly passenger volume by route
SELECT route_id, HOUR(boarding_time) as hour, COUNT(*) as passenger_count,
       date as travel_date
FROM tickets t JOIN trips tr ON t.trip_id = tr.trip_id
GROUP BY route_id, HOUR(boarding_time), date
ORDER BY route_id, hour;

-- Top boarding stops
SELECT s.stop_name, t.boarding_stop_id, COUNT(*) as boarding_count
FROM tickets t JOIN stops s ON t.boarding_stop_id = s.stop_id
GROUP BY s.stop_name, t.boarding_stop_id
ORDER BY boarding_count DESC
LIMIT 20;

-- Passenger flow by direction and time
SELECT tr.direction, HOUR(t.boarding_time) as hour,
       COUNT(*) as passengers, tr.route_id
FROM tickets t JOIN trips tr ON t.trip_id = tr.trip_id
GROUP BY tr.direction, HOUR(t.boarding_time), tr.route_id;
