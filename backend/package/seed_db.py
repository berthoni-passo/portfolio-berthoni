import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
import database
import models
import datetime

def force_seed_projects():
    # S'assurer que les tables sont créées
    models.Base.metadata.create_all(bind=database.engine)
    
    db = database.SessionLocal()
    
    try:
        if db.query(models.Project).count() > 0:
            print("🚀 Des projets existent déjà. Skip seed.")
            return

        projets_demo = [
            models.Project(
                title="Tableau de bord Power BI Financier",
                description="Modélisation d'une base de données SQL Server et création d'un tableau de bord de pilotage financier multi-pays sur Power BI.",
                tags="Business Intelligence, Power BI, SQL, DAX",
                demo_url="https://app.powerbi.com/demo",
                thumbnail_s3="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                published_at=datetime.datetime.utcnow()
            ),
            models.Project(
                title="Prédiction de Prix des Cryptomonnaies",
                description="Développement d'un pipeline de Machine Learning (Random Forest, LSTM) pour prédire les mouvements du Bitcoin.",
                tags="Machine Learning, Python, FastAPI, React",
                github_url="https://github.com/berthoni/crypto-predict",
                thumbnail_s3="https://images.unsplash.com/photo-1518544801976-3e159e50e5ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                published_at=datetime.datetime.utcnow()
            ),
            models.Project(
                title="Smart Home IoT Cloud Bridge",
                description="Architecture AWS cloud distribuée contrôlant des appareils domotiques hétérogènes.",
                tags="AWS, IoT, LLM, Python",
                github_url="https://github.com/berthoni/iot-bridge",
                thumbnail_s3="https://images.unsplash.com/photo-1558002038-1055907df827?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                published_at=datetime.datetime.utcnow()
            )
        ]
        
        db.bulk_save_objects(projets_demo)
        db.commit()
        print("✅ Seed terminé avec succès ! 3 projets ont été ajoutés.")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erreur lors du seed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    force_seed_projects()
