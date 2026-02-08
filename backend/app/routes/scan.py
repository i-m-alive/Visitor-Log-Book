# app/routes/scan.py
from fastapi import APIRouter, Body, HTTPException
from datetime import datetime
import uuid
import logging

from app.utils.image_utils import save_base64_image
from app.services.face_service import get_face_embedding, is_same_person
from app.services.storage_service import upload_face
from app.services.email_service import send_visit_email
from app.core.supabase import supabase
from app.schemas.visitor import VisitorCreate

router = APIRouter()
logger = logging.getLogger("scan")

@router.post("")
def scan_face(payload: dict = Body(...)):
    """
    One endpoint:
    - If face matches active visitor → EXIT
    - Else → ENTRY (requires visitor details)
    """

    image_base64 = payload.get("image_base64")
    visitor_data = payload.get("visitor")  # only for entry

    if not image_base64:
        raise HTTPException(status_code=422, detail="image_base64 required")

    # 1. Save image
    image_path = save_base64_image(image_base64)

    # 2. Get embedding
    embedding = get_face_embedding(image_path)
    if embedding is None:
        raise HTTPException(status_code=400, detail="No face detected")

    # 3. Check active visitors
    resp = supabase.table("visitors") \
        .select("id, name, face_embedding") \
        .is_("check_out_time", None) \
        .execute()

    active_visitors = resp.data or []

    for v in active_visitors:
        if v.get("face_embedding") and is_same_person(v["face_embedding"], embedding):
            # ✅ EXIT
            supabase.table("visitors").update({
                "check_out_time": datetime.utcnow().isoformat()
            }).eq("id", v["id"]).execute()

            return {
                "action": "exit",
                "message": f"Thank you for visiting, {v['name']}!"
            }

    # ❌ No match → ENTRY
    if not visitor_data:
        return {
            "action": "need_details",
            "message": "New visitor detected. Please fill details."
        }

    visitor = VisitorCreate(**visitor_data)

    # upload image
    photo_url = upload_face(image_path)

    record = {
        "face_id": str(uuid.uuid4()),
        "face_embedding": embedding,
        "photo_url": photo_url,
        "check_in_time": datetime.utcnow().isoformat(),
        **visitor.dict()
    }

    supabase.table("visitors").insert(record).execute()

    # send email (non-blocking)
    try:
        send_visit_email(
            visitor.person_email,
            visitor.name,
            visitor.purpose,
            visitor.phone
        )
    except Exception:
        logger.exception("Email failed")

    return {
        "action": "entry",
        "message": "Check-in successful"
    }
