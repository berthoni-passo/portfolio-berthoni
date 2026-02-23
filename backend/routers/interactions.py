from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db
from services import email_service

router = APIRouter(
    prefix="/api/interactions",
    tags=["Interactions"]
)

# --- Commentaires ---
@router.post("/comments", response_model=schemas.Comment)
def create_comment(comment: schemas.CommentCreate, project_id: int, db: Session = Depends(get_db)):
    """
    Ajoute un commentaire à un projet spécifique.
    """
    # Vérifier l'existence du projet
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé")
        
    db_comment = models.Comment(
        project_id=project_id,
        author_name=comment.author_name,
        content=comment.content
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

# --- Likes ---
@router.post("/likes")
def add_like(like_data: schemas.LikeCreate, ip_hash: str, db: Session = Depends(get_db)):
    """
    Ajoute un like sur un projet ou une photo. Empêche les doublons via ip_hash.
    """
    if like_data.target_type not in ["project", "photo"]:
        raise HTTPException(status_code=400, detail="Type de cible invalide")

    # Vérification d'unicité (1 IP = 1 Like par élément)
    existing = db.query(models.Like).filter(
        models.Like.target_type == like_data.target_type,
        models.Like.target_id == like_data.target_id,
        models.Like.ip_hash == ip_hash
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Vous avez déjà liké cet élément.")
    
    new_like = models.Like(
        target_type=like_data.target_type, 
        target_id=like_data.target_id, 
        ip_hash=ip_hash
    )
    db.add(new_like)
    db.commit()
    return {"status": "success", "message": "Like enregistré !"}

@router.get("/likes/{target_type}/{target_id}")
def get_likes_count(target_type: str, target_id: int, db: Session = Depends(get_db)):
    """
    Récupère le nombre total de likes pour un projet ou une photo.
    """
    if target_type not in ["project", "photo"]:
        raise HTTPException(status_code=400, detail="Type de cible invalide")

    count = db.query(models.Like).filter(
        models.Like.target_type == target_type,
        models.Like.target_id == target_id
    ).count()
    
    return {"count": count}

# --- Formulaire de Contact ---
@router.post("/contact", response_model=schemas.Message)
def send_contact_message(message: schemas.MessageCreate, db: Session = Depends(get_db)):
    """
    Reçoit un message depuis le formulaire de contact du site.
    Pourra déclencher l'envoi d'un email via AWS SES plus tard.
    """
    db_msg = models.Message(**message.model_dump())
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    
    # Send email notification via AWS SES
    email_service.send_contact_email(
        name=message.name,
        email=message.email,
        subject=message.subject,
        message=message.content
    )
    
    return db_msg
