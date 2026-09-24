#!/usr/bin/env python3
"""
Ingestion Validation Utility.
Generates the SRS-compliant Ingestion Validation Report across all transit data sources:
Source | Format | Schema | Rows | Partition | Validation status | Errors
"""

import os
import sys
import json
from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

def generate_ingestion_report(data_dir: str = 'data/raw') -> dict:
    data_path = Path(data_dir)
    tables = [
        ('tickets.csv', 'CSV', ['ticket_id', 'passenger_id', 'trip_id', 'route_id', 'boarding_stop_id', 'alighting_stop_id', 'boarding_time', 'alighting_time', 'fare', 'ticket_type', 'payment_method'], 'by date/route'),
        ('passenger_counts.csv', 'CSV', ['count_id', 'trip_id', 'stop_id', 'stop_sequence', 'boarding_count', 'alighting_count', 'current_load', 'timestamp', 'vehicle_capacity'], 'by route_id'),
        ('delays.csv', 'CSV', ['delay_id', 'trip_id', 'stop_id', 'route_id', 'vehicle_id', 'scheduled_time', 'actual_time', 'delay_minutes', 'delay_cause', 'weather_condition', 'is_peak', 'day_of_week'], 'by date/cause'),
        ('trips.csv', 'CSV', ['trip_id', 'schedule_id', 'route_id', 'vehicle_id', 'actual_departure', 'actual_arrival', 'direction', 'date', 'status'], 'by date/route'),
        ('routes.csv', 'CSV', ['route_id', 'route_name', 'route_type', 'direction', 'total_distance_km', 'num_stops', 'avg_travel_time_minutes', 'vehicle_capacity', 'frequency_peak_minutes', 'frequency_offpeak_minutes', 'operating_hours_start', 'operating_hours_end', 'base_fare'], 'unpartitioned'),
        ('stops.csv', 'CSV', ['stop_id', 'stop_name', 'latitude', 'longitude', 'zone', 'is_terminal', 'is_interchange', 'shelter_type', 'accessibility'], 'by zone'),
        ('vehicles.csv', 'CSV', ['vehicle_id', 'vehicle_type', 'capacity', 'year_manufactured', 'maintenance_status', 'fuel_type', 'assigned_route_id'], 'unpartitioned'),
        ('passengers.csv', 'CSV', ['passenger_id', 'registration_date', 'passenger_type', 'home_zone', 'preferred_routes', 'travel_frequency'], 'by home_zone'),
        ('schedules.csv', 'CSV', ['schedule_id', 'route_id', 'vehicle_id', 'departure_time', 'arrival_time', 'direction', 'service_date', 'is_active'], 'by route_id'),
        ('service_calendar.csv', 'CSV', ['date', 'day_of_week', 'day_name', 'is_weekend', 'is_holiday', 'holiday_name', 'season', 'special_event', 'temperature_high_c'], 'by year/month'),
        ('route_stops.csv', 'CSV', ['route_id', 'stop_id', 'stop_sequence', 'distance_from_origin_km', 'estimated_travel_time_minutes'], 'by route_id'),
        ('gps_events.csv', 'CSV', ['event_id', 'vehicle_id', 'trip_id', 'latitude', 'longitude', 'timestamp', 'speed_kmh', 'heading_degrees', 'route_id', 'stop_proximity_meters'], 'by route_id/time')
    ]
    
    report_rows = []
    
    for filename, fmt, expected_cols, partition in tables:
        file_path = data_path / filename
        if not file_path.exists():
            report_rows.append({
                'source': filename,
                'format': fmt,
                'schema': f"{len(expected_cols)} cols expected",
                'rows': 0,
                'partition': partition,
                'validation_status': 'FAILED',
                'errors': 'File not found'
            })
            continue
            
        try:
            # Read header only for schema check
            header_df = pd.read_csv(file_path, nrows=2)
            actual_cols = list(header_df.columns)
            missing_cols = [c for c in expected_cols if c not in actual_cols]
            
            # Count rows
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                row_count = sum(1 for _ in f) - 1
                
            status = 'VALID' if not missing_cols else 'SCHEMA_MISMATCH'
            err = f"Missing: {missing_cols}" if missing_cols else 'None'
            
            report_rows.append({
                'source': filename,
                'format': fmt,
                'schema': f"{len(actual_cols)} cols ({', '.join(actual_cols[:3])}...)",
                'rows': row_count,
                'partition': partition,
                'validation_status': status,
                'errors': err
            })
        except Exception as e:
            report_rows.append({
                'source': filename,
                'format': fmt,
                'schema': 'Error reading schema',
                'rows': 0,
                'partition': partition,
                'validation_status': 'ERROR',
                'errors': str(e)
            })
            
    summary = {
        'total_sources': len(report_rows),
        'valid_sources': sum(1 for r in report_rows if r['validation_status'] == 'VALID'),
        'total_rows_ingested': sum(r['rows'] for r in report_rows),
        'sources': report_rows
    }
    
    os.makedirs('reports', exist_ok=True)
    with open('reports/ingestion_validation.json', 'w') as f:
        json.dump(summary, f, indent=4)
        
    return summary

def print_report():
    res = generate_ingestion_report()
    print("=" * 105)
    print(f"{'Source':<22} | {'Format':<6} | {'Schema':<28} | {'Rows':<11} | {'Partition':<16} | {'Status':<8}")
    print("-" * 105)
    for r in res['sources']:
        print(f"{r['source']:<22} | {r['format']:<6} | {r['schema'][:28]:<28} | {r['rows']:<11,d} | {r['partition']:<16} | {r['validation_status']:<8}")
    print("=" * 105)
    print(f"Total Rows Ingested: {res['total_rows_ingested']:,} across {res['total_sources']} sources. Status: {res['valid_sources']}/{res['total_sources']} Valid.")
    print("=" * 105)

if __name__ == '__main__':
    print_report()
