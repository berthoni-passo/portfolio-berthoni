import boto3
import os
from botocore.exceptions import ClientError

region = os.getenv("AWS_REGION", "eu-west-3") # Paris region
ses_client = boto3.client('ses', region_name=region)

# L'adresse email de test vérifiée sur AWS SES (doit correspondre à l'identité envoyeur)
SENDER_EMAIL = os.getenv("SES_SENDER_EMAIL", "berthonipasso@gmail.com")
# L'adresse qui reçoit les notifications de contact
RECIPIENT_EMAIL = os.getenv("SES_RECIPIENT_EMAIL", "berthonipasso@gmail.com")

def send_contact_email(name: str, email: str, subject: str, message: str):
    """
    Envoie un e-mail à Berthoni via AWS SES lorsqu'un utilisateur remplit le formulaire.
    """
    # Pour AWS SES Sandbox, SENDER_EMAIL et RECIPIENT_EMAIL doivent être vérifiés dans la console AWS.
    
    body_text = f"Nouveau message de {name} ({email})\n\nSujet: {subject}\n\nMessage:\n{message}"
    
    body_html = f"""<html>
    <head></head>
    <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>Nouveau contact depuis le Portfolio</h2>
        <p><strong>De:</strong> {name} ({email})</p>
        <p><strong>Sujet:</strong> {subject}</p>
        <br>
        <div style="padding: 15px; background-color: #f9f9f9; border-left: 4px solid #4f8ef7;">
            {message.replace(chr(10), '<br>')}
        </div>
    </body>
    </html>
    """

    try:
        response = ses_client.send_email(
            Destination={
                'ToAddresses': [RECIPIENT_EMAIL],
            },
            Message={
                'Body': {
                    'Html': {
                        'Charset': "UTF-8",
                        'Data': body_html,
                    },
                    'Text': {
                        'Charset': "UTF-8",
                        'Data': body_text,
                    },
                },
                'Subject': {
                    'Charset': "UTF-8",
                    'Data': f"[Portfolio] Nouveau message de {name}: {subject}",
                },
            },
            Source=SENDER_EMAIL,
        )
    except ClientError as e:
        print(f"Erreur d'envoi SES: {e.response['Error']['Message']}")
        # Pour ne pas crasher l'API si SES n'est pas encore configuré (ex: hors Sandbox)
        pass
    else:
        print(f"Email envoyé! Message ID: {response['MessageId']}")
        return True
