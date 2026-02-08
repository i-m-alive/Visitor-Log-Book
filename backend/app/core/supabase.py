# app/core/supabase.py
from supabase import create_client
from app.core.config import SUPABASE_URL, SUPABASE_KEY

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase URL or KEY not set in environment variables")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
