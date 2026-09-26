"""
SQLAlchemy engine and session factory for PostgreSQL.
Replaces the Supabase REST client with direct PostgreSQL connection pooling.
"""

import logging
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker, Session, DeclarativeBase
from config.settings import settings

logger = logging.getLogger(__name__)

# Create engine with connection pooling tuned for 10M+ scale
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False,
)

# Session factory
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""
    pass


def get_db():
    """FastAPI dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_srs_users():
    """Ensure all 4 SRS roles (admin, executer, analyst, operator) exist in PostgreSQL."""
    from backend.app.database.models import User
    from backend.app.utils.security import hash_password
    
    users_to_seed = [
        {
            "id": "00000000-0000-0000-0000-000000000001",
            "email": settings.ADMIN_EMAIL,
            "full_name": settings.ADMIN_FULL_NAME,
            "hashed_password": hash_password(settings.ADMIN_PASSWORD),
            "role": "admin",
            "is_active": True,
        },
        {
            "id": "00000000-0000-0000-0000-000000000002",
            "email": "executer@urbantransit.iq",
            "full_name": "Executive Director",
            "hashed_password": hash_password("UrbanTransit2026!"),
            "role": "executer",
            "is_active": True,
        },
        {
            "id": "00000000-0000-0000-0000-000000000003",
            "email": "analyst@urbantransit.iq",
            "full_name": "Transit Operations Analyst",
            "hashed_password": hash_password("UrbanTransit2026!"),
            "role": "analyst",
            "is_active": True,
        },
        {
            "id": "00000000-0000-0000-0000-000000000004",
            "email": "operator@urbantransit.iq",
            "full_name": "Transit Operations Controller",
            "hashed_password": hash_password("UrbanTransit2026!"),
            "role": "operator",
            "is_active": True,
        },
    ]

    try:
        with SessionLocal() as db:
            for u in users_to_seed:
                existing = db.query(User).filter(User.email == u["email"]).first()
                if not existing:
                    new_user = User(**u)
                    db.add(new_user)
                else:
                    existing.role = u["role"]
                    existing.full_name = u["full_name"]
                    existing.hashed_password = u["hashed_password"]
            db.commit()
            logger.info("SRS roles verified/seeded in PostgreSQL successfully.")
    except Exception as e:
        logger.warning(f"Could not seed SRS roles into PostgreSQL: {e}")


def init_db():
    """Create all tables if they don't exist and seed SRS roles."""
    # Import models so they register with Base.metadata
    from backend.app.database import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified successfully.")
    seed_srs_users()


def check_db_connection() -> bool:
    """Verify PostgreSQL is reachable."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False
