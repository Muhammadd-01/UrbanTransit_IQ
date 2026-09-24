"""
SQLAlchemy ORM models for all UrbanTransit IQ tables.
Covers both application metadata tables (14) and transit data tables (12).
Indexed for 10M+ record query performance.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime,
    ForeignKey, JSON, Index, BigInteger
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from backend.app.database.engine import Base


# ==============================================================================
# Helper
# ==============================================================================
def new_uuid():
    return str(uuid.uuid4())


# ==============================================================================
# APPLICATION / METADATA TABLES (from original schema.sql)
# ==============================================================================

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=new_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    role = Column(String, default="viewer")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, default=new_uuid)
    name = Column(String)
    scale = Column(String)
    status = Column(String)
    record_count = Column(Integer)
    file_path = Column(String)
    created_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"

    id = Column(String, primary_key=True, default=new_uuid)
    dataset_id = Column(String, nullable=True)
    job_type = Column(String)
    status = Column(String)
    start_time = Column(DateTime)
    end_time = Column(DateTime, nullable=True)
    duration_seconds = Column(Float, nullable=True)
    records_processed = Column(Integer, nullable=True)
    stage = Column(String, nullable=True)
    error_details = Column(Text, nullable=True)
    logs = Column(Text, nullable=True)
    created_by = Column(String, nullable=True)


class ModelMetadata(Base):
    __tablename__ = "model_metadata"

    id = Column(String, primary_key=True, default=new_uuid)
    name = Column(String)
    version = Column(String)
    pipeline = Column(String)
    algorithm = Column(String)
    feature_list = Column(JSON)
    hyperparameters = Column(JSON)
    dataset_version = Column(String, nullable=True)
    training_date = Column(DateTime, default=datetime.utcnow)
    train_metrics = Column(JSON)
    validation_metrics = Column(JSON)
    test_metrics = Column(JSON)
    confusion_matrix = Column(JSON, nullable=True)
    artifact_path = Column(String, nullable=True)
    creator = Column(String, nullable=True)
    is_active = Column(Boolean, default=False)
    sample_predictions = Column(JSON, nullable=True)


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String, primary_key=True, default=new_uuid)
    model_id = Column(String, nullable=True)
    input_data = Column(JSON)
    prediction = Column(JSON)
    confidence = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)


class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=new_uuid)
    report_type = Column(String)
    title = Column(String)
    content = Column(JSON)
    dataset_id = Column(String, nullable=True)
    created_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    file_path = Column(String, nullable=True)


class RecommendationHistory(Base):
    __tablename__ = "recommendation_history"

    id = Column(String, primary_key=True, default=new_uuid)
    recommendation = Column(Text)
    reason = Column(Text)
    supporting_metrics = Column(JSON)
    affected_route = Column(String, nullable=True)
    affected_time = Column(String, nullable=True)
    expected_impact = Column(String, nullable=True)
    confidence_level = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    dataset_id = Column(String, nullable=True)


class SimulationScenario(Base):
    __tablename__ = "simulation_scenarios"

    id = Column(String, primary_key=True, default=new_uuid)
    name = Column(String)
    parameters = Column(JSON)
    results = Column(JSON, nullable=True)
    created_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    dataset_id = Column(String, nullable=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=new_uuid)
    user_id = Column(String, nullable=True)
    action = Column(String)
    entity_type = Column(String)
    entity_id = Column(String, nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


class DataQualityAudit(Base):
    __tablename__ = "data_quality_audits"

    id = Column(String, primary_key=True, default=new_uuid)
    dataset_id = Column(String, nullable=True, index=True)
    record_id = Column(String, nullable=True)
    original_value = Column(String, nullable=True)
    issue_type = Column(String)
    affected_column = Column(String, nullable=True)
    cleaning_rule = Column(String, nullable=True)
    corrected_value = Column(String, nullable=True)
    status = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)


class DualPipelineComparison(Base):
    __tablename__ = "dual_pipeline_comparisons"

    id = Column(String, primary_key=True, default=new_uuid)
    case_id = Column(String)
    actual_result = Column(String)
    spark_result = Column(String)
    python_result = Column(String)
    spark_probability = Column(Float, nullable=True)
    python_probability = Column(Float, nullable=True)
    numerical_difference = Column(Float, nullable=True)
    match_status = Column(Boolean, nullable=True)
    consistency_status = Column(String, nullable=True)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class SparkJobMonitor(Base):
    __tablename__ = "spark_job_monitor"

    id = Column(String, primary_key=True, default=new_uuid)
    job_name = Column(String)
    status = Column(String)
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    duration_seconds = Column(Float, nullable=True)
    records_processed = Column(Integer, nullable=True)
    stage = Column(String, nullable=True)
    error_details = Column(Text, nullable=True)
    log_path = Column(String, nullable=True)


class PerformanceBenchmark(Base):
    __tablename__ = "performance_benchmarks"

    id = Column(String, primary_key=True, default=new_uuid)
    operation = Column(String)
    dataset_size = Column(Integer)
    duration_seconds = Column(Float)
    throughput_rps = Column(Float, nullable=True)
    memory_mb = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)


class ConfigurationChange(Base):
    __tablename__ = "configuration_changes"

    id = Column(String, primary_key=True, default=new_uuid)
    user_id = Column(String, nullable=True)
    setting_key = Column(String)
    old_value = Column(String, nullable=True)
    new_value = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)


# ==============================================================================
# TRANSIT DATA TABLES (for 2M+ bulk data storage)
# ==============================================================================

class Route(Base):
    __tablename__ = "routes"

    route_id = Column(String, primary_key=True)
    route_name = Column(String, nullable=False)
    route_type = Column(String)
    route_color = Column(String, nullable=True)
    route_description = Column(Text, nullable=True)
    fare_zone = Column(String, nullable=True)
    distance_km = Column(Float, nullable=True)
    avg_travel_time_min = Column(Float, nullable=True)
    num_stops = Column(Integer, nullable=True)
    frequency_peak = Column(Integer, nullable=True)
    frequency_offpeak = Column(Integer, nullable=True)
    operator = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Stop(Base):
    __tablename__ = "stops"

    stop_id = Column(String, primary_key=True)
    stop_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    zone = Column(String, nullable=True)
    stop_type = Column(String, nullable=True)
    is_terminal = Column(Boolean, default=False)
    has_shelter = Column(Boolean, default=False)
    accessibility = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class RouteStop(Base):
    __tablename__ = "route_stops"

    id = Column(String, primary_key=True, default=new_uuid)
    route_id = Column(String, index=True)
    stop_id = Column(String, index=True)
    stop_sequence = Column(Integer)
    distance_from_start_km = Column(Float, nullable=True)


class Vehicle(Base):
    __tablename__ = "vehicles"

    vehicle_id = Column(String, primary_key=True)
    vehicle_type = Column(String)
    capacity = Column(Integer)
    fuel_type = Column(String, nullable=True)
    manufacture_year = Column(Integer, nullable=True)
    last_maintenance = Column(DateTime, nullable=True)
    status = Column(String, default="active")
    assigned_route = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ServiceCalendar(Base):
    __tablename__ = "service_calendar"

    id = Column(String, primary_key=True, default=new_uuid)
    service_id = Column(String, index=True)
    date = Column(DateTime)
    day_type = Column(String)
    is_holiday = Column(Boolean, default=False)
    holiday_name = Column(String, nullable=True)


class Trip(Base):
    __tablename__ = "trips"

    trip_id = Column(String, primary_key=True)
    route_id = Column(String, index=True)
    vehicle_id = Column(String, index=True)
    service_date = Column(DateTime, index=True)
    direction = Column(String, nullable=True)
    scheduled_departure = Column(DateTime, nullable=True)
    actual_departure = Column(DateTime, nullable=True)
    scheduled_arrival = Column(DateTime, nullable=True)
    actual_arrival = Column(DateTime, nullable=True)
    status = Column(String, default="completed")

    __table_args__ = (
        Index('idx_trips_route_date', 'route_id', 'service_date'),
    )


class Passenger(Base):
    __tablename__ = "passengers"

    passenger_id = Column(String, primary_key=True)
    passenger_type = Column(String)
    fare_category = Column(String, nullable=True)
    home_zone = Column(String, nullable=True)
    registration_date = Column(DateTime, nullable=True)
    is_frequent = Column(Boolean, default=False)


class Ticket(Base):
    __tablename__ = "tickets"

    ticket_id = Column(String, primary_key=True)
    trip_id = Column(String, index=True)
    passenger_id = Column(String, index=True)
    boarding_stop = Column(String, nullable=True)
    alighting_stop = Column(String, nullable=True)
    fare_amount = Column(Float, nullable=True)
    payment_method = Column(String, nullable=True)
    timestamp = Column(DateTime, index=True)

    __table_args__ = (
        Index('idx_tickets_trip_passenger', 'trip_id', 'passenger_id'),
    )


class PassengerCount(Base):
    __tablename__ = "passenger_counts"

    id = Column(String, primary_key=True, default=new_uuid)
    stop_id = Column(String, index=True)
    route_id = Column(String, index=True)
    direction = Column(String, nullable=True)
    timestamp = Column(DateTime, index=True)
    boarding = Column(Integer, default=0)
    alighting = Column(Integer, default=0)
    load = Column(Integer, default=0)

    __table_args__ = (
        Index('idx_pcounts_stop_time', 'stop_id', 'timestamp'),
    )


class Delay(Base):
    __tablename__ = "delays"

    id = Column(String, primary_key=True, default=new_uuid)
    trip_id = Column(String, index=True)
    route_id = Column(String, index=True)
    stop_id = Column(String, nullable=True, index=True)
    delay_minutes = Column(Float)
    delay_category = Column(String, nullable=True)
    cause = Column(String, nullable=True)
    timestamp = Column(DateTime, index=True)
    is_peak = Column(Boolean, default=False)

    __table_args__ = (
        Index('idx_delays_route_time', 'route_id', 'timestamp'),
    )


class GpsEvent(Base):
    __tablename__ = "gps_events"

    id = Column(String, primary_key=True, default=new_uuid)
    vehicle_id = Column(String, index=True)
    trip_id = Column(String, nullable=True, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    speed_kmh = Column(Float, nullable=True)
    heading = Column(Float, nullable=True)
    timestamp = Column(DateTime, index=True)
    event_type = Column(String, nullable=True)

    __table_args__ = (
        Index('idx_gps_vehicle_time', 'vehicle_id', 'timestamp'),
    )
