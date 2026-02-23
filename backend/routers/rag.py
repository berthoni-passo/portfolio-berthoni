from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Any

import models, schemas, auth
from database import get_db
from services import bedrock_service

router = APIRouter(
    prefix="/api/rag",
    tags=["RAG & AI Chatbot"]
)

# Nous devrons exécuter un ALTER TABLE manuellement sous Oracle 23ai pour ajouter la colonne VECTOR
# car SQLAlchemy Standard n'a pas encore le type Vector natif complet multi-bases.
# On la gère en SQL brut en cas de besoin.

@router.post("/ingest")
def ingest_knowledge(
    source: str, 
    content: str, 
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.get_current_admin_user)
):
    """
    [Admin] Ajoute un bloc de texte (CV, Explication projet...) à la base de connaissance Oracle.
    Ce texte est d'abord transformé en Vecteur par Amazon Titan (Bedrock).
    """
    if len(content.strip()) < 10:
        raise HTTPException(status_code=400, detail="Contenu trop court.")

    # 1. Générer l'embedding avec AWS Titan
    try:
        embedding = bedrock_service.get_embedding(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur Bedrock API: {str(e)}")

    # 2. Sauvegarder dans Oracle
    # Comme la colonne "vector_data" nécessitera un type 'VECTOR', on gérera d'abord l'insertion standard,
    # puis l'update vectoriel brut (ou on s'appuiera sur les JSON Arrays convertibles si c'est plus simple).
    # Pour l'instant, stockons juste le texte si la colonne vectorielle n'est pas prête.
    
    db_item = models.RagPortfolio(source=source, content=content)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    # 3. Requête SQL brute pour insérer le vecteur dans Oracle 23ai 
    # (À activer UNIQUEMENT si la table possède bien "vector_data VECTOR(512)")
    try:
        # Example to show intent (Commented out until table structure is verified):
        # sql = text("UPDATE rag_portfolio SET vector_data = :vector_str WHERE id = :id")
        # db.execute(sql, {"vector_str": str(embedding), "id": db_item.id})
        # db.commit()
        pass 
    except Exception as e:
        print(f"Warning: Vector column missing or insert failed: {e}")

    return {
        "status": "success", 
        "message": f"Connaissance '{source}' indexée.", 
        "id": db_item.id,
        "embedding_preview": embedding[:5] # Show first 5 dimensions only
    }

@router.post("/chat")
def ask_chatbot(question: str, db: Session = Depends(get_db)):
    """
    Pose une question au Chatbot. Le système trouve le texte le plus pertinent 
    en base (Recherche Vectorielle), puis laisse Claude répondre.
    """
    # 1. Vectoriser la question
    try:
        q_embedding = bedrock_service.get_embedding(question)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erreur Bedrock d'analyse de la question.")

    # 2. Chercher les documents Oracle les plus proches (Vector Similarity Search)
    # En Oracle 23ai : SELECT content FROM rag_portfolio ORDER BY VECTOR_DISTANCE(vector_data, :query_vec) FETCH FIRST 3 ROWS ONLY;
    
    # Simuler le RAG si la fonction vectorielle Oracle n'est pas encore activée
    # (On prendra tout le texte en brut comme contexte temporaire pour prouver que Claude répond).
    docs = db.query(models.RagPortfolio).all()
    context_str = "\n\n".join([f"[{d.source}] {d.content}" for d in docs])
    
    if not context_str:
        return {"answer": "Je suis l'assistant de Berthoni. La base de connaissances est actuellement vide, je ne peux pas encore répondre à vos questions sur son profil !"}

    # 3. Interroger Claude
    try:
        claude_response = bedrock_service.ask_claude(prompt=question, context=context_str)
        return {"answer": claude_response}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erreur du LLM Claude.")
