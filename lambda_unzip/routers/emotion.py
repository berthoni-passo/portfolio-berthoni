from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import boto3
import base64
import os

router = APIRouter(
    prefix="/api/ml",
    tags=["ML"]
)

class ImagePayload(BaseModel):
    image_base64: str  # base64 de l'image capturée depuis le navigateur

# Mapping émotions → emoji
EMOTION_EMOJI = {
    "HAPPY": "😄",
    "SAD": "😢",
    "ANGRY": "😠",
    "SURPRISED": "😲",
    "CALM": "😐",
    "DISGUSTED": "🤢",
    "CONFUSED": "😕",
    "FEAR": "😨"
}

@router.post("/emotion")
def detect_emotion(payload: ImagePayload):
    """
    Reçoit une image en base64, appelle AWS Rekognition detect_faces,
    retourne les émotions avec leurs scores de confiance.
    """
    # 1. Décoder l'image base64
    try:
        # Supprimer le prefixe data URL si présent (ex: "data:image/jpeg;base64,...")
        image_data = payload.image_base64
        if "," in image_data:
            image_data = image_data.split(",")[1]
        image_bytes = base64.b64decode(image_data)
    except Exception:
        raise HTTPException(status_code=400, detail="Image base64 invalide")

    # 2. Appel AWS Rekognition
    try:
        client = boto3.client(
            "rekognition",
            region_name=os.getenv("AWS_REKOGNITION_REGION", "eu-west-1"),  # Rekognition non dispo en eu-west-3
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
        )
        response = client.detect_faces(
            Image={"Bytes": image_bytes},
            Attributes=["ALL"]
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Erreur AWS Rekognition : {str(e)}")

    # 3. Vérifier qu'un visage est détecté
    face_details = response.get("FaceDetails", [])
    if not face_details:
        raise HTTPException(status_code=422, detail="Aucun visage détecté dans l'image")

    # 4. Prendre le premier visage (le plus confiant)
    face = face_details[0]

    # 5. Extraire et trier les émotions
    emotions_raw = face.get("Emotions", [])
    emotions = sorted(emotions_raw, key=lambda e: e["Confidence"], reverse=True)

    emotions_formatted = [
        {
            "type": e["Type"],
            "emoji": EMOTION_EMOJI.get(e["Type"], "🙂"),
            "confidence": round(e["Confidence"], 1)
        }
        for e in emotions
    ]

    # 6. Infos bonus du visage
    age_range = face.get("AgeRange", {})
    gender = face.get("Gender", {})
    smile = face.get("Smile", {})
    eyeglasses = face.get("Eyeglasses", {})

    return {
        "dominant_emotion": emotions_formatted[0] if emotions_formatted else None,
        "emotions": emotions_formatted,
        "face_info": {
            "age_range": {
                "low": age_range.get("Low"),
                "high": age_range.get("High")
            },
            "gender": gender.get("Value"),
            "gender_confidence": round(gender.get("Confidence", 0), 1),
            "smile": smile.get("Value", False),
            "eyeglasses": eyeglasses.get("Value", False)
        },
        "faces_detected": len(face_details)
    }
