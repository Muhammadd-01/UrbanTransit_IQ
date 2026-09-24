"""
Audit logging service tracking administrative and operational actions.
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid
from backend.app.database.engine import SessionLocal
from backend.app.database.models import AuditLog

logger = logging.getLogger(__name__)

_IN_MEMORY_AUDIT_LOGS: List[Dict[str, Any]] = []

def _audit_to_dict(log: AuditLog) -> Dict[str, Any]:
    return {
        "id": str(log.id),
        "user_id": str(log.user_id) if log.user_id else None,
        "action": log.action,
        "entity_type": log.entity_type,
        "entity_id": log.entity_id,
        "details": log.details,
        "ip_address": log.ip_address,
        "timestamp": log.timestamp.isoformat() if log.timestamp else None,
    }

def log_action(
    user_id: Optional[str],
    action: str,
    entity_type: str,
    entity_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
) -> Dict[str, Any]:
    """Records an action to PostgreSQL audit_logs or local buffer."""
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
        with SessionLocal() as db:
            new_log = AuditLog(
                id=log_id,
                user_id=user_id,
                action=action,
                entity_type=entity_type,
                entity_id=entity_id,
                details=details or {},
                ip_address=ip_address or "127.0.0.1"
            )
            db.add(new_log)
            db.commit()
    except Exception as e:
        logger.warning(f"Could not persist audit log to PostgreSQL: {e}")

    _IN_MEMORY_AUDIT_LOGS.append(record)
    logger.info(f"Audit log recorded: {action} on {entity_type} by {user_id}")
    return record


def get_audit_logs(limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieve audit logs."""
    try:
        with SessionLocal() as db:
            logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
            if logs:
                return [_audit_to_dict(log) for log in logs]
    except Exception as e:
        logger.warning(f"Failed to fetch audit logs from PostgreSQL: {e}")

    return list(reversed(_IN_MEMORY_AUDIT_LOGS[-limit:]))
