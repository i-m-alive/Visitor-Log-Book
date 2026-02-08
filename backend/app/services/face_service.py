# app/services/face_service.py
from deepface import DeepFace
import numpy as np
import logging
from typing import Optional, List

logger = logging.getLogger("face_service")

# Choose model and detector backend (opencv is safe on Windows)
MODEL_NAME = "ArcFace"           # accurate embedding model
DETECTOR_BACKEND = "opencv"      # detector backend: 'opencv','ssd','mtcnn','dlib' etc.
# threshold for cosine similarity — tune if you see false positives/negatives
DEFAULT_THRESHOLD = 0.60

def get_face_embedding(image_path: str) -> Optional[List[float]]:
    """
    Returns a list (embedding vector) or None if face not detected / error.
    DeepFace.represent returns a list of dicts; each dict contains 'embedding'.
    """
    try:
        reps = DeepFace.represent(
            img_path=image_path,
            model_name=MODEL_NAME,
            detector_backend=DETECTOR_BACKEND,
            enforce_detection=False
        )
        if not reps or not isinstance(reps, list) or "embedding" not in reps[0]:
            return None
        embedding = reps[0]["embedding"]
        embedding = [float(x) for x in embedding]
        return embedding
    except Exception as e:
        logger.exception("DeepFace embedding error: %s", e)
        return None

def cosine_similarity(a, b):
    a_arr = np.array(a, dtype=np.float32)
    b_arr = np.array(b, dtype=np.float32)
    denom = (np.linalg.norm(a_arr) * np.linalg.norm(b_arr))
    if denom == 0:
        return 0.0
    return float(np.dot(a_arr, b_arr) / denom)

def is_same_person(known_embedding, unknown_embedding, threshold=DEFAULT_THRESHOLD):
    """
    Returns True if similarity >= threshold.
    known_embedding and unknown_embedding are lists (from DB and current image).
    """
    try:
        sim = cosine_similarity(known_embedding, unknown_embedding)
        return sim >= threshold
    except Exception as e:
        logger.exception("Error computing similarity: %s", e)
        return False
