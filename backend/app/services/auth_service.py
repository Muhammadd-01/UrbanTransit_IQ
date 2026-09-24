"""
Authentication and user management service with PostgreSQL and local fallback.
"""

import logging
from typing import Optional, Dict, Any
from datetime import datetime
from backend.app.database.engine import SessionLocal
from backend.app.database.models import User
from backend.app.utils.security import hash_password, verify_password

logger = logging.getLogger(__name__)

# Default in-memory user registry for development/demo mode
_DEV_USERS: Dict[str, Dict[str, Any]] = {
    "affan@urbantransit.iq": {
        "id": "00000000-0000-0000-0000-000000000001",
        "email": "affan@urbantransit.iq",
        "full_name": "Muhammad Affan",
        "hashed_password": hash_password("UrbanTransit2026!"),
        "role": "admin",
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
        "last_login": None,
    },
    "evaluator@urbantransit.iq": {
        "id": "00000000-0000-0000-0000-000000000002",
        "email": "evaluator@urbantransit.iq",
        "full_name": "Competition Evaluator",
        "hashed_password": hash_password("UrbanTransit2026!"),
        "role": "analyst",
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
        "last_login": None,
    }
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
    """Retrieve user from PostgreSQL if configured, otherwise from local registry."""
    try:
        with SessionLocal() as db:
            user = db.query(User).filter(User.email == email).first()
            if user:
                return _user_to_dict(user)
    except Exception as e:
        logger.warning(f"Failed to query PostgreSQL for user {email}: {e}. Falling back to local store.")

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
    email = user_create.email
    hashed = hash_password(user_create.password)
    role = getattr(user_create, "role", "viewer")
    
    try:
        with SessionLocal() as db:
            new_user = User(
                email=email,
                full_name=user_create.full_name,
                hashed_password=hashed,
                role=role,
                is_active=True
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            return _user_to_dict(new_user)
    except Exception as e:
        logger.warning(f"Failed to persist user in PostgreSQL: {e}. Storing in memory.")

    user_record = {
        "id": "00000000-0000-0000-0000-000000000003",
        "email": email,
        "full_name": user_create.full_name,
        "hashed_password": hashed,
        "role": role,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
        "last_login": None,
    }
    _DEV_USERS[email] = user_record
    return user_record
