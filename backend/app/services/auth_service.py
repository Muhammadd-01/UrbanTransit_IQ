"""
Authentication and user management service with PostgreSQL and local fallback.
"""

import logging
from typing import Optional, Dict, Any
from datetime import datetime
from config.settings import settings
from backend.app.database.engine import SessionLocal
from backend.app.database.models import User
from backend.app.utils.security import hash_password, verify_password

logger = logging.getLogger(__name__)

# Default in-memory user registry for development/demo mode conforming to SRS roles:
# 1. Admin, 2. Executer, 3. Analyst, 4. Operator
_DEV_USERS: Dict[str, Dict[str, Any]] = {
    settings.ADMIN_EMAIL: {
        "id": "00000000-0000-0000-0000-000000000001",
        "email": settings.ADMIN_EMAIL,
        "full_name": settings.ADMIN_FULL_NAME,
        "hashed_password": hash_password(settings.ADMIN_PASSWORD),
        "role": "admin",
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
        "last_login": None,
    },
    "admin@urbantransit.iq": {
        "id": "00000000-0000-0000-0000-000000000002",
        "email": "admin@urbantransit.iq",
        "full_name": "System Administrator",
        "hashed_password": hash_password("UrbanTransit2026!"),
        "role": "admin",
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
        "last_login": None,
    },
    "executer@urbantransit.iq": {
        "id": "00000000-0000-0000-0000-000000000003",
        "email": "executer@urbantransit.iq",
        "full_name": "Executive Director",
        "hashed_password": hash_password("UrbanTransit2026!"),
        "role": "executer",
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
        "last_login": None,
    },
    "analyst@urbantransit.iq": {
        "id": "00000000-0000-0000-0000-000000000004",
        "email": "analyst@urbantransit.iq",
        "full_name": "Transit Operations Analyst",
        "hashed_password": hash_password("UrbanTransit2026!"),
        "role": "analyst",
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
        "last_login": None,
    },
    "evaluator@urbantransit.iq": {
        "id": "00000000-0000-0000-0000-000000000005",
        "email": "evaluator@urbantransit.iq",
        "full_name": "Competition Evaluator",
        "hashed_password": hash_password("UrbanTransit2026!"),
        "role": "analyst",
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
        "last_login": None,
    },
    "operator@urbantransit.iq": {
        "id": "00000000-0000-0000-0000-000000000006",
        "email": "operator@urbantransit.iq",
        "full_name": "Transit Operations Controller",
        "hashed_password": hash_password("UrbanTransit2026!"),
        "role": "operator",
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
        "last_login": None,
    },
}


def _user_to_dict(user: User) -> Dict[str, Any]:
    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "hashed_password": user.hashed_password,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "last_login": user.last_login.isoformat() if user.last_login else None,
    }


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Retrieve user from MongoDB if configured, otherwise from local registry."""
    try:
        from backend.app.database.mongo import get_mongo_db
        db = get_mongo_db()
        user = db.users.find_one({"email": email}, {"_id": 0})
        if user:
            return user
    except Exception as e:
        logger.warning(f"Failed to query MongoDB for user {email}: {e}. Falling back to local store.")

    return _DEV_USERS.get(email)


def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate user with email and password."""
    user = get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user.get("hashed_password", "")):
        return None
    return user


def create_user(user_create: Any) -> Dict[str, Any]:
    """Create a new user account."""
    import uuid
    email = user_create.email
    hashed = hash_password(user_create.password)
    role = getattr(user_create, "role", "viewer")
    user_record = {
        "id": str(uuid.uuid4()),
        "email": email,
        "full_name": user_create.full_name,
        "hashed_password": hashed,
        "role": role,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
        "last_login": None
    }
    try:
        from backend.app.database.mongo import get_mongo_db
        db = get_mongo_db()
        db.users.update_one({"email": email}, {"$set": user_record}, upsert=True)
        return user_record
    except Exception as e:
        logger.warning(f"Failed to persist user in MongoDB: {e}. Storing in memory.")
        _DEV_USERS[email] = user_record
        return user_record
