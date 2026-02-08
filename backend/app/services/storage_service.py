# app/services/storage_service.py
from app.core.supabase import supabase
import uuid
import logging

logger = logging.getLogger("storage_service")
BUCKET = "visitor-faces"

def upload_face(image_path: str):
    """
    Uploads local image file to Supabase storage bucket and returns a public URL string.
    """
    file_name = f"{uuid.uuid4()}.jpg"
    try:
        with open(image_path, "rb") as f:
            supabase.storage.from_(BUCKET).upload(file_name, f)
    except Exception as e:
        logger.exception("Supabase upload failed: %s", e)
        raise

    # try to extract a URL string from get_public_url response
    resp = supabase.storage.from_(BUCKET).get_public_url(file_name)
    # resp may be a dict with keys like 'publicURL' or 'publicUrl' depending on library version
    if isinstance(resp, dict):
        for key in ("public_url", "publicURL", "publicUrl"):
            if key in resp:
                return resp[key]
    # fallback: return raw resp (could be string)
    return resp
