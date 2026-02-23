import boto3
import os
import uuid
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
    Upload une image vers le bucket S3 et retourne son l'URL publique.
    """
    s3_client = get_s3_client()
    if not s3_client:
        raise HTTPException(status_code=500, detail="Service d'upload S3 non configuré.")
        
    try:
        # Sécurise le nom de fichier et génère un UUID
        file_extension = file.filename.split('.')[-1]
        unique_filename = f"projects/{uuid.uuid4()}.{file_extension}"
        
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
        raise HTTPException(status_code=500, detail="Erreur lors de l'upload de l'image.")
