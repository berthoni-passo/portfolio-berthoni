from database import engine
from models import Base

print("--- Réinitialisation de la base de données Oracle ---")
print("Suppression des anciennes tables...")
Base.metadata.drop_all(bind=engine)
print("Nouvelles tables créées depuis 'create_admin.py' au prochain lancement.")
print("Opération terminée !")
