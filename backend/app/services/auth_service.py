"""
Authentication and user management service with Supabase and local fallback.
"""

import logging
from typing import Optional, Dict, Any
from datetime import datetime
from backend.app.database.supabase_client import get_supabase_client, get_admin_client
from backend.app.utils.security import hash_password, verify_password, create_access_token

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


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Retrieve user from Supabase if configured, otherwise from local registry."""
    client = get_supabase_client()
    if client:
        try:
            res = client.table("users").select("*").eq("email", email).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            logger.warning(f"Failed to query Supabase for user {email}: {e}. Falling back to local store.")

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
    client = get_admin_client() or get_supabase_client()
    email = user_create.email
    hashed = hash_password(user_create.password)
    user_record = {
        "email": email,
        "full_name": user_create.full_name,
        "hashed_password": hashed,
        "role": getattr(user_create, "role", "viewer"),
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
    }

    if client:
        try:
            res = client.table("users").insert(user_record).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.warning(f"Failed to persist user in Supabase: {e}. Storing in memory.")

    _DEV_USERS[email] = user_record
    return user_record
