import sys
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import User
from auth import get_password_hash

def create_admin(name: str, email: str, password: str):
    # Créer les tables si elles n'existent pas encore
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # Vérifier si l'utilisateur existe déjà
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"L'utilisateur {email} existe déjà.")
            return

        # Création de l'utilisateur Admin
        hashed_password = get_password_hash(password)
        new_admin = User(
            name=name,
            email=email,
            password_hash=hashed_password,
            role="admin"
        )
        db.add(new_admin)
        db.commit()
        print(f"✅ Compte administrateur '{email}' créé avec succès !")
    except Exception as e:
        print(f"Erreur lors de la création : {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("--- Initialisation du compte Administrateur ---")
    if len(sys.argv) == 4:
        name = sys.argv[1]
        email = sys.argv[2]
        password = sys.argv[3]
        create_admin(name, email, password)
    else:
        print("Usage: python create_admin.py \"Votre Nom\" \"votre.email@exemple.com\" \"VotreMotDePasseSecret\"")
        print("Exemple: python create_admin.py \"Berthoni Passo\" \"admin@berthoni.com\" \"mypassword123\"")
