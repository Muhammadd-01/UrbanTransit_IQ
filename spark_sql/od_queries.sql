-- Full OD Matrix
SELECT boarding_stop_id as origin, alighting_stop_id as destination,
       COUNT(*) as trip_count
FROM tickets
GROUP BY boarding_stop_id, alighting_stop_id
ORDER BY trip_count DESC;

-- OD Matrix filtered by route and date range
SELECT t.boarding_stop_id as origin, t.alighting_stop_id as destination,
       COUNT(*) as trip_count
FROM tickets t JOIN trips tr ON t.trip_id = tr.trip_id
WHERE tr.route_id = '{route_id}'
  AND tr.date BETWEEN '{start_date}' AND '{end_date}'
GROUP BY t.boarding_stop_id, t.alighting_stop_id;

-- Top 20 corridors
SELECT s1.stop_name as origin_name, s2.stop_name as dest_name,
       t.boarding_stop_id, t.alighting_stop_id, COUNT(*) as volume
FROM tickets t
JOIN stops s1 ON t.boarding_stop_id = s1.stop_id
JOIN stops s2 ON t.alighting_stop_id = s2.stop_id
GROUP BY s1.stop_name, s2.stop_name, t.boarding_stop_id, t.alighting_stop_id
ORDER BY volume DESC
LIMIT 20;
