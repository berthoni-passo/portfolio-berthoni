from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, database, auth
from routers import projects, interactions, rag, analytics, emotion
import os

# Création des tables dans Oracle — wrappé pour éviter un crash si Oracle démarre encore
try:
    models.Base.metadata.create_all(bind=database.engine)
    print("✅ Connexion Oracle OK — tables synchronisées")
except Exception as e:
    print(f"⚠️  Oracle pas encore prêt au démarrage : {e}")
    print("   → Le backend démarre quand même, réessayez les routes dans quelques secondes.")

app = FastAPI(title="Berthoni Passo - Portfolio Backend", version="1.0.0")

app.include_router(projects.router)
app.include_router(interactions.router)
app.include_router(rag.router)
app.include_router(analytics.router)
app.include_router(emotion.router)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "✅ API Portfolio Berthoni is running on Oracle 23ai"}


@app.post("/api/auth/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès administrateur requis")
        
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# Route Admin basique
@app.get("/api/admin/dashboard", dependencies=[Depends(auth.get_current_admin_user)])
def read_dashboard(db: Session = Depends(database.get_db)):
    total_likes = db.query(models.Like).count()
    total_projects = db.query(models.Project).count()
    # A étoffer avec la table Analytics
    return {"metrics": {"likes": total_likes, "projects": total_projects}}

# Plus tard on ajoutera les blueprints/routers ici...
