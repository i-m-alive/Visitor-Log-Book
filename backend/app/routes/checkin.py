# app/routes/checkin.py
from fastapi import APIRouter, Body, HTTPException
from datetime import datetime
import uuid
import logging

from app.utils.image_utils import save_base64_image
from app.services.face_service import get_face_embedding
from app.services.storage_service import upload_face
from app.services.email_service import send_visit_email
from app.core.supabase import supabase
from app.schemas.visitor import VisitorCreate

router = APIRouter()
logger = logging.getLogger("checkin")

@router.post("")
def visitor_checkin(
    image_base64: str = Body(..., description="Data URL string (data:image/jpeg;base64,...)"),
    visitor: VisitorCreate = Body(...)
):
    """
    Save image, extract embedding (DeepFace), store visitor record in Supabase,
    upload photo to Storage, send notification email.
    """
    # 1) save image locally
    image_path = save_base64_image(image_base64)
    logger.info("Saved image to %s", image_path)

    # 2) compute embedding
    embedding = get_face_embedding(image_path)
    if embedding is None:
        raise HTTPException(status_code=400, detail="No face detected in the image")

    # 3) upload photo to Supabase storage
    try:
        photo_url = upload_face(image_path)
    except Exception as e:
        logger.exception("Storage upload failed")
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {e}")

    # 4) create DB record
    face_id = str(uuid.uuid4())
    record = {
        "face_id": face_id,
        "face_embedding": embedding,           # list of floats (stored as jsonb)
        "photo_url": photo_url,
        "check_in_time": datetime.utcnow().isoformat(),
        **visitor.dict()
    }

    try:
        resp = supabase.table("visitors").insert(record).execute()
    except Exception as e:
        logger.exception("Supabase insert failed")
        raise HTTPException(status_code=500, detail=str(e))

    # 5) notify the person to meet
    try:
        send_visit_email(
            to_email=visitor.person_email,
            visitor_name=visitor.name,
            purpose=visitor.purpose,
            phone=visitor.phone
        )
    except Exception:
        # don't fail check-in if email fails — just log and return success with warning
        logger.exception("Failed to send email notification")

    return {"message": "Check-in successful", "face_id": face_id}
