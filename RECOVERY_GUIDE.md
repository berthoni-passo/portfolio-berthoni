# 🆘 Guide de Secours - Portfolio Berthoni Passo

Ce document explique comment reconstruire tout votre écosystème à partir de zéro en cas de perte totale.

## 🏗️ 1. Architecture Globale
- **Frontend** : Next.js exporté en statique sur **S3** + **CloudFront**.
- **Backend** : **AWS EC2** (Amazon Linux 2023) faisant tourner **Docker**.
- **Base de données** : **Oracle 23ai FREE** (dans Docker).

---

## 🖥️ 2. Reconstruction du Backend (EC2)

### A. Lancer l'instance
1. Créez une instance `t3.medium` (minimum 4 Go RAM requis pour Oracle).
2. Ouvrez les ports **80** (HTTP) et **22** (SSH).
3. Connectez-vous en SSH.

### B. Installer Docker & Git
```bash
sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
```
*(Déconnectez-vous et reconnectez-vous pour appliquer les groupes)*

### C. Lancer Oracle 23ai
```bash
docker run -d --name oracle23ai \
  -p 1521:1521 \
  -e ORACLE_PWD=votre_mot_de_passe \
  container-registry.oracle.com/database/free:latest
```

### D. Déployer l'API Python
1. Clonez votre repo : `git clone <URL_REPO>`
2. Installez Python et dependances :
   ```bash
   sudo dnf install -y python3-pip
   pip install -r backend/requirements.txt
   ```
3. **Important** : Créez le fichier `backend/.env` avec vos accès Oracle et votre `GITHUB_TOKEN`.
4. Lancez l'API de manière persistante :
   ```bash
   cd backend
   nohup python3 -m uvicorn main:app --host 127.0.0.1 --port 8000 > /tmp/backend.log 2>&1 &
   ```

---

## 🌐 3. Reconstruction du Frontend (S3/CloudFront)

1. **Build Local** :
   ```bash
   npm install
   npm run build
   ```
2. **Sync S3** :
   ```bash
   aws s3 sync out s3://votre-bucket-name --delete
   ```
3. **Invalidation** : Allez sur CloudFront et créez une invalidation `/*`.

---

## 🛠️ 4. Debugging & Points de Vigilance

### ⚠️ Le site affiche "Faux Projets" ?
- **Cause** : Votre DNS pointe vers une ancienne IP ou l'URL API hardcodée a changé.
- **Réduction** : Vérifiez que vous utilisez bien `www.berthonipassoportfolio.com`. Si l'IP EC2 a changé, vous devez mettre à jour les fichiers frontend (chercher l'ancienne IP et la remplacer) puis refaire un build.

### ⚠️ Le bouton Admin ne se connecte pas ?
- Vérifiez que le backend tourne : `ps aux | grep uvicorn`.
- Vérifiez les logs : `cat /tmp/backend.log`.

### ⚠️ Oracle ne démarre pas ?
- Vérifiez la RAM : `free -m`. Si moins de 2 Go sont libres, le conteneur Oracle s'arrêtera tout seul.

---

## 📅 5. Automatisation (Heures d'ouverture)
N'oubliez pas de recréer les règles **EventBridge** (Start 08:00 UTC / Stop 17:00 UTC) pour économiser vos coûts AWS.
