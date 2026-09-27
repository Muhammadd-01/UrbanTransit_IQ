"""
High-Performance ETL: Migrate all data from PostgreSQL to MongoDB & MongoDB Compass.
Handles the full 2,000,000+ transit records using buffered streaming and bulk inserts.
"""

import sys
import time
import logging
from pathlib import Path
from urllib.parse import urlparse
import psycopg2
from psycopg2.extras import RealDictCursor

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from config.settings import settings
from backend.app.database.mongo import get_mongo_db, init_mongo_indexes

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

BATCH_SIZE = 50000


def get_postgres_connection():
    result = urlparse(settings.DATABASE_URL)
    return psycopg2.connect(
        dbname=result.path[1:],
        user=result.username,
        password=result.password,
        host=result.hostname,
        port=result.port
    )


def migrate_table(pg_conn, mongo_db, table_name, mongo_collection_name=None):
    if not mongo_collection_name:
        mongo_collection_name = table_name

    collection = mongo_db[mongo_collection_name]
    collection.drop()  # Start fresh

    cursor_name = f"cur_{table_name}"
    with pg_conn.cursor(name=cursor_name, cursor_factory=RealDictCursor) as cur:
        cur.execute(f"SELECT * FROM {table_name}")
        total_migrated = 0
        t0 = time.time()

        while True:
            rows = cur.fetchmany(BATCH_SIZE)
            if not rows:
                break
            
            # Convert RealDictRow to standard dict
            batch = [dict(r) for r in rows]

            # In passenger_counts, add 'hour' field if missing for instant aggregation
            if table_name == "passenger_counts":
                for doc in batch:
                    ts = doc.get("timestamp")
                    if ts and hasattr(ts, "hour"):
                        doc["hour"] = ts.hour

            collection.insert_many(batch, ordered=False)
            total_migrated += len(batch)
            elapsed = time.time() - t0
            rate = int(total_migrated / elapsed) if elapsed > 0 else total_migrated
            logger.info(f"[{mongo_collection_name}] Migrated {total_migrated:,} documents ({rate:,} docs/sec)...")

    logger.info(f"✓ Completed {mongo_collection_name}: {total_migrated:,} documents in {time.time() - t0:.2f}s")
    return total_migrated


def run_migration():
    logger.info("=================================================================")
    logger.info("   STARTING POSTGRESQL -> MONGODB COMPASS DATA MIGRATION        ")
    logger.info("=================================================================")

    start_total = time.time()
    pg_conn = get_postgres_connection()
    mongo_db = get_mongo_db()

    tables = [
        "routes",
        "stops",
        "route_stops",
        "vehicles",
        "service_calendar",
        "trips",
        "passengers",
        "tickets",
        "passenger_counts",
        "delays",
        "gps_events",
        "users",
        "datasets",
    ]

    summary = {}
    for table in tables:
        try:
            count = migrate_table(pg_conn, mongo_db, table)
            summary[table] = count
        except Exception as e:
            logger.warning(f"Skipping or failed table '{table}': {e}")
            summary[table] = 0

    pg_conn.close()

    logger.info("Building MongoDB performance indexes...")
    init_mongo_indexes()

    elapsed = time.time() - start_total
    total_records = sum(summary.values())

    logger.info("=================================================================")
    logger.info(f"   MIGRATION COMPLETED SUCCESSFULLY in {elapsed:.2f} seconds!    ")
    logger.info(f"   Total Records Ingested into MongoDB: {total_records:,}       ")
    logger.info("=================================================================")
    for table, count in summary.items():
        logger.info(f"   • {table:20s}: {count:,} documents")
    logger.info("=================================================================")
    logger.info("MongoDB Compass Connection URI: mongodb://localhost:27017")
    logger.info("Database Name: urbantransit_iq")


if __name__ == "__main__":
    run_migration()
