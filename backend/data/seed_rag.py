import sys
import os

# Ajouter le parent folder au path pour l'import relatif si on exécute depuis `backend/data`
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from models import RagPortfolio
from services import bedrock_service

def seed_rag():
    print("--- Démarrage de l'Ingestion RAG ---")
    
    cv_path = os.path.join(os.path.dirname(__file__), "cv_berthoni_rag.txt")
    with open(cv_path, "r", encoding="utf-8") as f:
        content = f.read()

    print("1. Appel à AWS Bedrock (Titan) pour vectoriser le texte...")
    try:
        embedding = bedrock_service.get_embedding(content)
        print(f"✅ Vectorisation terminée (Dimensions: {len(embedding)})")
    except Exception as e:
        print(f"❌ Erreur Bedrock: {e}")
        return

    print("2. Sauvegarde dans Oracle 23ai...")
    db = SessionLocal()
    try:
        # Check if CV is already loaded
        existing = db.query(RagPortfolio).filter(RagPortfolio.source == "cv_complet").first()
        if existing:
            print("Le CV est déjà en base. Suppression de l'ancienne version...")
            db.delete(existing)
            db.commit()

        db_item = RagPortfolio(source="cv_complet", content=content)
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        
        # Simulated vector column update (until Oracle VECTOR column is fully active)
        # sql = text("UPDATE rag_portfolio SET vector_data = :vec WHERE id = :id")
        # db.execute(sql, {"vec": str(embedding), "id": db_item.id})
        # db.commit()

        print("✅ Le cerveau du Chatbot RAG a été mis à jour avec le profil !")
    except Exception as e:
        print(f"❌ Erreur Base de données: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_rag()
