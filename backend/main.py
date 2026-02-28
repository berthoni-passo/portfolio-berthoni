from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session
import models, database, auth
from routers import projects, interactions, rag, analytics, emotion
import os

# Rate limiter (basé sur l'IP)
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

# Création des tables dans Oracle
try:
    models.Base.metadata.create_all(bind=database.engine)
    print("✅ Connexion Oracle OK — tables synchronisées")
except Exception as e:
    print(f"⚠️  Oracle pas encore prêt au démarrage : {e}")

# Désactiver les docs en production
IS_DEV = os.getenv("ENV", "development") == "development"
app = FastAPI(
    title="Berthoni Passo - Portfolio Backend",
    version="1.0.0",
    docs_url="/docs" if IS_DEV else None,       # Swagger caché en prod
    redoc_url="/redoc" if IS_DEV else None,      # ReDoc caché en prod
    openapi_url="/openapi.json" if IS_DEV else None,
)

# Rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(projects.router)
app.include_router(interactions.router)
app.include_router(rag.router)
app.include_router(analytics.router)
app.include_router(emotion.router)

# ── CORS strict ──────────────────────────────────────────────
ALLOWED_ORIGINS = [
    os.getenv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000"),
    "http://localhost:3000",
    "https://berthonipassoportfolio.com",
    "http://berthonipassoportfolio.com",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],  # pas PATCH, pas OPTIONS
    allow_headers=["Content-Type", "Authorization"],  # whitelist explicite
)

# ── Security Headers ─────────────────────────────────────────
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if os.getenv("ENV") == "production":
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    return response

# ── Max request size (5 MB) ──────────────────────────────────
@app.middleware("http")
async def limit_upload_size(request: Request, call_next):
    if request.headers.get("content-length"):
        size = int(request.headers["content-length"])
        if size > 5 * 1024 * 1024:  # 5 MB
            return JSONResponse(status_code=413, content={"detail": "Payload trop volumineux (max 5 MB)"})
    return await call_next(request)

@app.get("/")
def read_root():
    return {"message": "✅ API Portfolio Berthoni is running"}

@app.post("/api/auth/token")
@limiter.limit("5/minute")  # Anti brute-force : max 5 tentatives/min par IP
def login_for_access_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
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
    return {"metrics": {"likes": total_likes, "projects": total_projects}}
