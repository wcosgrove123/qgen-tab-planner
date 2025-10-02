"""
Database utilities for Supabase connection
"""

from supabase import create_client, Client
from .config import settings


_supabase_client: Client = None


def get_db() -> Client:
    """
    Get Supabase client (singleton pattern)

    Returns:
        Supabase client instance
    """
    global _supabase_client

    if _supabase_client is None:
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY  # Use service key for backend access
        )

    return _supabase_client


async def test_connection() -> bool:
    """Test database connection"""
    try:
        db = get_db()
        result = db.table("projects").select("count", count="exact").limit(0).execute()
        print(f"✅ Database connected ({result.count} projects)")
        return True

    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        return False
