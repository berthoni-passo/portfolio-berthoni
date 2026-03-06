import os
import httpx
import logging

logger = logging.getLogger(__name__)

def trigger_frontend_build():
    """
    Déclenche un repository_dispatch sur GitHub pour lancer le build Next.js (deploy-frontend.yml).
    Nécessite GITHUB_TOKEN et GITHUB_REPO dans les variables d'environnement.
    Exemple de GITHUB_REPO: "berthoni-passo/portfolio-berthoni"
    """
    token = os.getenv("GITHUB_TOKEN")
    repo = os.getenv("GITHUB_REPO", "berthoni-passo/portfolio-berthoni")
    
    if not token:
        logger.warning("GITHUB_TOKEN manquant: le webhook CI/CD vers GitHub Actions est désactivé.")
        return False

    url = f"https://api.github.com/repos/{repo}/dispatches"
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": f"Bearer {token}"
    }
    payload = {
        "event_type": "trigger_frontend_build"
    }

    try:
        # L'appel est fait de manière asynchrone si possible ou avec timeout court
        response = httpx.post(url, headers=headers, json=payload, timeout=5.0)
        if response.status_code == 204:
            logger.info(f"🚀 Webhook GitHub Actions envoyé avec succès vers {repo}!")
            return True
        else:
            logger.error(f"❌ Erreur Webhook GitHub Actions ({response.status_code}): {response.text}")
            return False
    except Exception as e:
        logger.error(f"❌ Exception lors de l'envoi du webhook GitHub Settings: {str(e)}")
        return False
