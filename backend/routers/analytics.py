from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
import hashlib
import models, database, auth
import datetime
from pydantic import BaseModel
from typing import Optional

router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"]
)

class AnalyticsEventCreate(BaseModel):
    event_type: str
    target_id: Optional[int] = None

# 1. Enregistrer un événement public
@router.post("/")
def log_event(event: AnalyticsEventCreate, request: Request, db: Session = Depends(database.get_db)):
    # Hash IP simple ou récupération
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get('user-agent', 'unknown')
    
    # Simple hash for anonymity (or use auth ip_hash mechanics)
    import hashlib
    ip_hash = hashlib.sha256(client_ip.encode('utf-8')).hexdigest()

    new_event = models.Analytics(
        event_type=event.event_type,
        target_id=event.target_id,
        ip_hash=ip_hash,
        user_agent=user_agent[:250] # Limite de la colonne SQL
    )
    db.add(new_event)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Erreur interne (Oracle Analytics)")
        
    return {"status": "success", "message": f"Event {event.event_type} tracked"}

# 2. Récupérer les stats (Admin uniquement)
@router.get("/summary", dependencies=[Depends(auth.get_current_admin_user)])
def get_analytics_summary(db: Session = Depends(database.get_db)):
    # Compter les occurrences par type d'événement
    results = db.query(
        models.Analytics.event_type, 
        func.count(models.Analytics.id)
    ).group_by(models.Analytics.event_type).all()
    
    summary = {event: count for event, count in results}
    
    # Nombre de visiteurs uniques (estimé par ip_hash)
    unique_visitors = db.query(func.count(func.distinct(models.Analytics.ip_hash))).scalar()
    
    # KPI des Projets vus :
    project_views = db.query(
        models.Analytics.target_id,
        func.count(models.Analytics.id)
    ).filter(models.Analytics.event_type == 'project_view') \
     .group_by(models.Analytics.target_id).all()
     
    project_stats = {f"project_{pid}": count for pid, count in project_views if pid is not None}

    return {
        "global": summary,
        "unique_visitors": unique_visitors,
        "projects_views": project_stats
    }
