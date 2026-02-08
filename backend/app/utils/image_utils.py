# app/utils/image_utils.py
import base64
import uuid
import os
import logging

logger = logging.getLogger("image_utils")
TEMP_DIR = "temp"

def save_base64_image(base64_str: str) -> str:
    """
    Accepts a data URL or raw base64 string, saves to temp/<uuid>.jpg and returns path.
    """
    os.makedirs(TEMP_DIR, exist_ok=True)
    image_id = str(uuid.uuid4())
    image_path = os.path.join(TEMP_DIR, f"{image_id}.jpg")

    # handle data URLs e.g. data:image/jpeg;base64,/9j/4AAQ...
    if "," in base64_str:
        base64_str = base64_str.split(",")[1]

    try:
        image_bytes = base64.b64decode(base64_str)
    except Exception as e:
        logger.exception("Base64 decode failed: %s", e)
        raise

    with open(image_path, "wb") as f:
        f.write(image_bytes)

    return image_path
