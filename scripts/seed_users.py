"""
Seed or update the 4 SRS roles into PostgreSQL:
1. Admin (Muhammad Affan / Admin)
2. Executer (Executive Director)
3. Analyst (Transit Operations Analyst)
4. Operator (Transit Operations Controller)
"""

import sys
import logging
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

from backend.app.database.engine import init_db, seed_srs_users, check_db_connection

def main():
    logger.info("Checking PostgreSQL connection...")
    if not check_db_connection():
        logger.error(
            "Could not connect to PostgreSQL. Make sure PostgreSQL is running on port 5433.\n"
            "To start PostgreSQL with Docker Compose, run:\n"
            "  docker compose up -d postgres\n"
        )
        sys.exit(1)

    logger.info("Initializing database tables...")
    init_db()
    logger.info("Seeding SRS users...")
    seed_srs_users()
    logger.info("All 4 SRS user accounts have been verified/created in PostgreSQL!")

if __name__ == "__main__":
    main()
