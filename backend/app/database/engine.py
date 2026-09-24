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


def init_db():
    """Create all tables if they don't exist."""
    # Import models so they register with Base.metadata
    from backend.app.database import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified successfully.")


def check_db_connection() -> bool:
    """Verify PostgreSQL is reachable."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False
