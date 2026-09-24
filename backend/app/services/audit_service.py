"""
Audit logging service tracking administrative and operational actions.
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid
from backend.app.database.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

_IN_MEMORY_AUDIT_LOGS: List[Dict[str, Any]] = []


def log_action(
    user_id: Optional[str],
    action: str,
    entity_type: str,
    entity_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
) -> Dict[str, Any]:
    """Records an action to Supabase audit_logs or local buffer."""
    record = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "action": action,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "details": details or {},
        "ip_address": ip_address or "127.0.0.1",
        "timestamp": datetime.utcnow().isoformat(),
    }

    client = get_supabase_client()
    if client:
        try:
            client.table("audit_logs").insert(record).execute()
        except Exception as e:
            logger.warning(f"Could not persist audit log to Supabase: {e}")

    _IN_MEMORY_AUDIT_LOGS.append(record)
    logger.info(f"Audit log recorded: {action} on {entity_type} by {user_id}")
    return record


def get_audit_logs(limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieve audit logs."""
    client = get_supabase_client()
    if client:
        try:
            res = client.table("audit_logs").select("*").order("timestamp", desc=True).limit(limit).execute()
            if res.data:
                return res.data
        except Exception as e:
            logger.warning(f"Failed to fetch audit logs from Supabase: {e}")

    return list(reversed(_IN_MEMORY_AUDIT_LOGS[-limit:]))
