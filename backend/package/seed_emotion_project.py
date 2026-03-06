import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
import database
import models
import datetime

def force_seed_emotion():
    db = database.SessionLocal()
    
    try:
        # Check if project already exists
        existing = db.query(models.Project).filter(models.Project.title == "Détection d'émotions en temps réel").first()
        if existing:
            print("🚀 Le projet existe déjà.")
            return

        print("🌱 Création du projet Détection d'émotions dans Oracle 23ai...")
        
        projet_emotion = models.Project(
            title="Détection d'émotions en temps réel",
            description="Activez votre caméra et regardez l'IA déchiffrer vos émotions instantanément. Ce modèle de Computer Vision analyse votre visage pour identifier 8 émotions (joie, tristesse, colère, surprise...) avec un score de confiance. Une démo interactive qui illustre toute la puissance du Deep Learning appliqué à la vision par ordinateur.",
            tags="Computer Vision, Deep Learning, Python, FastAPI",
            demo_url="/lab",
            thumbnail_s3="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
            published_at=datetime.datetime.utcnow()
        )
        
        db.add(projet_emotion)
        db.commit()
        print("✅ Projet d'émotions rajouté avec succès !")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erreur lors du seed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    force_seed_emotion()
