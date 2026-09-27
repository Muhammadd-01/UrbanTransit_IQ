"""
MongoDB client, connection management, and indexing for UrbanTransit IQ.
Connects to MongoDB (port 27017) and manages all transit and platform collections.
Compatible with MongoDB Compass (mongodb://localhost:27017).
"""

import logging
from typing import Optional
from pymongo import MongoClient, ASCENDING, DESCENDING, IndexModel
from pymongo.database import Database
from config.settings import settings

logger = logging.getLogger(__name__)

_mongo_client: Optional[MongoClient] = None


def get_mongo_client() -> MongoClient:
    """Singleton MongoDB client instance."""
    global _mongo_client
    if _mongo_client is None:
        logger.info(f"Connecting to MongoDB at {settings.MONGO_URI}...")
        _mongo_client = MongoClient(
            settings.MONGO_URI,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=30000,
            maxPoolSize=50,
        )
    return _mongo_client


def get_mongo_db() -> Database:
    """Returns the primary UrbanTransit IQ MongoDB database handle."""
    client = get_mongo_client()
    return client[settings.MONGO_DB_NAME]


def check_mongo_connection() -> bool:
    """Verifies that MongoDB server is reachable."""
    try:
        client = get_mongo_client()
        client.admin.command("ping")
        return True
    except Exception as e:
        logger.error(f"MongoDB connection check failed: {e}")
        return False


def init_mongo_indexes():
    """
    Creates performance-optimized indexes across all collections
    to ensure sub-second analytical queries over 2M+ records.
    """
    db = get_mongo_db()
    logger.info("Initializing MongoDB indexes...")

    try:
        # 1. passenger_counts (2M records)
        db.passenger_counts.create_indexes([
            IndexModel([("route_id", ASCENDING)]),
            IndexModel([("timestamp", DESCENDING)]),
            IndexModel([("hour", ASCENDING)]),
            IndexModel([("route_id", ASCENDING), ("hour", ASCENDING)]),
            IndexModel([("load", DESCENDING)]),
        ])

        # 2. delays (500K records)
        db.delays.create_indexes([
            IndexModel([("route_id", ASCENDING)]),
            IndexModel([("timestamp", DESCENDING)]),
            IndexModel([("delay_minutes", DESCENDING)]),
            IndexModel([("cause", ASCENDING)]),
            IndexModel([("route_id", ASCENDING), ("timestamp", DESCENDING)]),
        ])

        # 3. trips (10K records)
        db.trips.create_indexes([
            IndexModel([("trip_id", ASCENDING)], unique=True),
            IndexModel([("route_id", ASCENDING)]),
            IndexModel([("actual_departure", ASCENDING)]),
            IndexModel([("route_id", ASCENDING), ("direction", ASCENDING), ("actual_departure", ASCENDING)]),
        ])

        # 4. tickets (2M records)
        db.tickets.create_indexes([
            IndexModel([("boarding_stop", ASCENDING), ("alighting_stop", ASCENDING)]),
            IndexModel([("route_id", ASCENDING)]),
            IndexModel([("purchase_time", DESCENDING)]),
        ])

        # 5. stops (200 records)
        db.stops.create_indexes([
            IndexModel([("stop_id", ASCENDING)], unique=True),
            IndexModel([("zone", ASCENDING)]),
        ])

        # 6. routes (50 records)
        db.routes.create_indexes([
            IndexModel([("route_id", ASCENDING)], unique=True),
        ])

        # 7. vehicles (300 records)
        db.vehicles.create_indexes([
            IndexModel([("vehicle_id", ASCENDING)], unique=True),
            IndexModel([("assigned_route", ASCENDING)]),
            IndexModel([("status", ASCENDING)]),
        ])

        # 8. users (auth)
        db.users.create_indexes([
            IndexModel([("email", ASCENDING)], unique=True),
        ])

        # 9. datasets
        db.datasets.create_indexes([
            IndexModel([("id", ASCENDING)], unique=True),
        ])

        logger.info("MongoDB indexes created successfully.")
    except Exception as e:
        logger.warning(f"Error creating MongoDB indexes (may already exist): {e}")
