"""
Audit logging service tracking administrative and operational actions.
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid
from backend.app.database.mongo import get_mongo_db

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
    """Records an action to MongoDB audit_logs or local buffer."""
    log_id = str(uuid.uuid4())
    record = {
        "id": log_id,
        "user_id": user_id,
        "action": action,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "details": details or {},
        "ip_address": ip_address or "127.0.0.1",
        "timestamp": datetime.utcnow().isoformat(),
    }

    try:
        db = get_mongo_db()
        db.audit_logs.insert_one(record)
    except Exception as e:
        logger.warning(f"Could not persist audit log to MongoDB: {e}")
        _IN_MEMORY_AUDIT_LOGS.append(record)

    logger.info(f"Audit log recorded: {action} on {entity_type} by {user_id}")
    return record


def get_audit_logs(limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieve audit logs."""
    try:
        db = get_mongo_db()
        logs = list(db.audit_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit))
        if logs:
            return logs
    except Exception as e:
        logger.warning(f"Failed to fetch audit logs from MongoDB: {e}")

    return list(reversed(_IN_MEMORY_AUDIT_LOGS[-limit:]))
