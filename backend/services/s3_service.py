import boto3
import os
import uuid
import shutil
from fastapi import UploadFile, HTTPException

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "eu-west-3")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "portfolio-berthoni-assets")

# Initialisation différée pour ne pas crasher l'app au démarrage
# si les clés ne sont pas encore définies dans le .env
def get_s3_client():
    if not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
        print("ATTENTION: Identifiants AWS S3 manquants dans le .env")
        return None
        
    return boto3.client(
        's3',
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )

def upload_image_to_s3(file: UploadFile) -> str:
    """
    Upload une image vers le bucket S3 et retourne son URL publique.
    Si les identifiants S3 ne sont pas configurés (en développement), l'image
    est sauvegardée localement dans le dossier public/uploads du frontend Next.js en fallback.
    """
    s3_client = get_s3_client()
    
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"projects/{uuid.uuid4()}.{file_extension}"
        
    if not s3_client:
        print("Fallback S3 -> sauvegarde locale enclenchée.")
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        public_dir = os.path.join(base_dir, "public", "uploads", "projects")
        
        # S'assurer que le dossier final existe
        os.makedirs(public_dir, exist_ok=True)
        
        # Le chemin final du fichier (e.g public/uploads/projects/uuid.png)
        local_filename = os.path.basename(unique_filename)
        local_path = os.path.join(public_dir, local_filename)
        
        try:
            with open(local_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # On retourne l'URL chemin relatif pour le frontend Next.js
            return f"/uploads/projects/{local_filename}"
        except Exception as e:
            print(f"Erreur Sauvegarde Locale : {str(e)}")
            raise HTTPException(status_code=500, detail="Erreur lors de la sauvegarde locale de l'image (Fallback S3).")

    try:
        # Upload vers S3
        s3_client.upload_fileobj(
            file.file,
            S3_BUCKET_NAME,
            unique_filename,
            ExtraArgs={
                "ContentType": file.content_type,
            }
        )
        
        # Créer et retourner l'URL d'accès publique
        url = f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{unique_filename}"
        return url
        
    except Exception as e:
        print(f"Erreur Upload S3 : {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'upload de l'image vers S3: {str(e)}")
