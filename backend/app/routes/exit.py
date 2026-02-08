# app/routes/exit.py
from fastapi import APIRouter, Body, HTTPException
from datetime import datetime
import logging

from app.utils.image_utils import save_base64_image
from app.services.face_service import get_face_embedding, is_same_person
from app.core.supabase import supabase

router = APIRouter()
logger = logging.getLogger("exit")

@router.post("")
def visitor_exit(payload: dict = Body(...)):
    image_base64 = payload.get("image_base64")

    if not image_base64:
        raise HTTPException(status_code=422, detail="image_base64 is required")

    image_path = save_base64_image(image_base64)

    unknown_embedding = get_face_embedding(image_path)
    if unknown_embedding is None:
        raise HTTPException(status_code=400, detail="No face detected in the image")

    # fetch visitors who haven't checked out yet
    resp = supabase.table("visitors") \
        .select("id, name, face_embedding, check_out_time") \
        .is_("check_out_time", None) \
        .execute()

    visitors = resp.data if resp and hasattr(resp, "data") else []
    if not visitors:
        raise HTTPException(status_code=404, detail="No active visitors found")

    for visitor in visitors:
        emb = visitor.get("face_embedding")
        # skip if no embedding stored
        if not emb:
            continue
        try:
            if is_same_person(emb, unknown_embedding):
                # update checkout time
                supabase.table("visitors").update({
                    "check_out_time": datetime.utcnow().isoformat()
                }).eq("id", visitor["id"]).execute()

                return {"message": "Thank you for visiting!", "name": visitor["name"]}
        except Exception:
            logger.exception("Error comparing embeddings for visitor id=%s", visitor.get("id"))
            continue

    raise HTTPException(status_code=404, detail="Visitor not recognized")
