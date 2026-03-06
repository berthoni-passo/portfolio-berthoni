import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
import database
import models
from services import bedrock_service

def force_seed_rag():
    db = database.SessionLocal()
    
    cv_content = """Berthoni Passo est un Ingénieur Data et Architecte IA résidant à Paris, France.
    Il est doublement certifié Microsoft Fabric Data Engineer Associate et Power BI Data Analyst Associate.
    Ses compétences techniques incluent :
    - Data & DB : Oracle 23ai, PostgreSQL, SQL Server, Microsoft Fabric, dbt.
    - IA & Machine Learning : Python, Scikit-learn, LangChain, RAG, AWS Bedrock.
    - Cloud : AWS (Lambda, S3, EC2), Azure, Docker.
    
    Il recherche actuellement des missions ou opportunités en tant que Data Engineer ou Spécialiste IA.
    Voici certains de ses projets: 
    - Un tableau de bord financier sur Power BI
    - Un pipeline ML de prédiction des cryptomonnaies
    - Un pont domotique IoT avec AWS et LangGraph.
    
    Berthoni est toujours passionné par la valeur que les données peuvent apporter aux entreprises, que ce soit à travers l'ETL, le ML ou la BI pure !"""
    
    try:
        # Check if already seeded
        if db.query(models.RagPortfolio).count() > 0:
            print("Déjà seedé.")
            return

        print("Génération du vecteur via AWS Bedrock Titan...")
        # embedding = bedrock_service.get_embedding(cv_content) 
        
        # On va l'insérer
        item = models.RagPortfolio(
            source="CV_General",
            content=cv_content
        )
        db.add(item)
        db.commit()
        print("Super! RAG data insérées avec succès.")
    except Exception as e:
        db.rollback()
        print(f"Erreur seed rag : {e}")
    finally:
        db.close()

if __name__ == "__main__":
    force_seed_rag()
