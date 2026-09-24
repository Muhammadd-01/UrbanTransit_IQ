import logging
from typing import Optional
from supabase import create_client, Client
from config.settings import settings

logger = logging.getLogger(__name__)

_supabase_client = None
_admin_client = None

def get_supabase_client() -> Optional[Client]:
    global _supabase_client
    if not _supabase_client:
        if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
            logger.warning("Supabase credentials not configured.")
            return None
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    return _supabase_client

def get_admin_client() -> Optional[Client]:
    global _admin_client
    if not _admin_client:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            logger.warning("Supabase admin credentials not configured.")
            return None
        _admin_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    return _admin_client
