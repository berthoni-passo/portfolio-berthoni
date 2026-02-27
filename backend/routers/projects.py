from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db
from services import s3_service
from auth import get_current_admin_user

router = APIRouter(
    prefix="/api/projects",
    tags=["Projects"]
)

@router.get("/", response_model=List[schemas.Project])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Récupère la liste de tous les projets publiés.
    """
    projects = db.query(models.Project).offset(skip).limit(limit).all()
    return projects

@router.post("/upload-thumbnail")
def upload_thumbnail(file: UploadFile = File(...)):
    """
    [Admin] Upload de la miniature d'un projet sur AWS S3.
    """
    s3_url = s3_service.upload_image_to_s3(file)
    return {"url": s3_url}


@router.get("/{project_id}", response_model=schemas.Project)
def read_project(project_id: int, db: Session = Depends(get_db)):
    """
    Récupère un projet spécifique avec ses images et commentaires.
    """
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Projet non trouvé")
    return project

@router.post("/", response_model=schemas.Project)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    """
    [Admin] Crée un nouveau projet dans le portfolio.
    Pour l'instant la route est ouverte pour tester, mais on ajoutera le décorateur Admin plus tard.
    """
    db_project = models.Project(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.put("/{project_id}", response_model=schemas.Project)
def update_project(
    project_id: int, 
    project_update: schemas.ProjectUpdate, 
    db: Session = Depends(get_db), 
    current_admin: models.User = Depends(get_current_admin_user)
):
    """
    [Admin] Met à jour les informations d'un projet existant.
    """
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé")
    
    update_data = project_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)
        
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: int, db: Session = Depends(get_db), current_admin: models.User = Depends(get_current_admin_user)):
    """
    [Admin] Supprime un projet du portfolio ainsi que ses données associées.
    """
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé")
    
    # Nettoyage manuel des entités liées pour éviter les conflits de ForeignKey
    db.query(models.ProjectImage).filter(models.ProjectImage.project_id == project_id).delete(synchronize_session=False)
    db.query(models.Comment).filter(models.Comment.project_id == project_id).delete(synchronize_session=False)
    db.query(models.Like).filter(models.Like.target_type == 'project', models.Like.target_id == project_id).delete(synchronize_session=False)
    # Les stats Analytics pourraient être gardées ou supprimées. Gardons-les.
    
    db.delete(project)
    db.commit()
    return None

@router.post("/{project_id}/images", response_model=schemas.ProjectImage)
def upload_project_image(
    project_id: int, 
    file: UploadFile = File(...), 
    caption: str = None, 
    db: Session = Depends(get_db)
):
    """
    [Admin] Upload une image additionnelle pour un projet sur AWS S3.
    """
    # Vérifier l'existence du projet
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé")
        
    # Upload S3
    s3_url = s3_service.upload_image_to_s3(file)
    
    # Sauvegarde en bdd
    db_image = models.ProjectImage(
        project_id=project_id,
        s3_url=s3_url,
        caption=caption
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    
    return db_image
