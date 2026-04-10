# 🚀 Guide de Déploiement - ByGagoos Ink

## Phase 1: Préparation

### Prérequis
- ✅ Code poussé sur GitHub: https://github.com/LeMizoo/bygagoos-prod
- ✅ MongoDB Atlas cluster (gratuit: M0)
- Comptes Vercel et Railway

---

## Phase 2: Déploiement Frontend sur Vercel

### Étape 1: Signez-vous sur Vercel
1. Allez à https://vercel.com
2. Cliquez **Sign Up** → choisissez GitHub
3. Autorisez Vercel à accéder à vos repos

### Étape 2: Importer le projet
1. Cliquez **New Project**
2. Sélectionnez repo: `bygagoos-prod`
3. **Framework Preset**: React ✓
4. **Root Directory**: `frontend/`
5. Cliquez **Deploy**

### Étape 3: Variables d'environnement Vercel
Après le déploiement, allez dans **Settings → Environment Variables** et ajoutez:

```
VITE_API_BASE_URL = https://your-backend-railway-url/api
```

**Note**: Vous obtiendrez l'URL Railway après le déploiement du backend.

### Étape 4: Re-deploy
Après ajout de variables d'env:
1. Allez à **Deployments**
2. Cliquez sur le dernier deployment
3. Cliquez **Redeploy**

✅ Votre frontend est maintenant en ligne!

---

## Phase 3: Déploiement Backend sur Railway

### Étape 1: Signez-vous sur Railway
1. Allez à https://railway.app
2. Cliquez **Login** → GitHub

### Étape 2: Créer un nouveau projet
1. Cliquez **New Project**
2. Sélectionnez **Deploy from GitHub repo**
3. Sélectionnez: `LeMizoo/bygagoos-prod`
4. Sélectionnez le **root directory**: `backend/`

### Étape 3: Ajouter MongoDB
1. Cliquez **+ New** → **Database** → **MongoDB**
2. Railway créera un MongoDB avec `MONGODB_URI` automatiquement
3. Attendez que le conteneur démarre

### Étape 4: Ajouter les variables d'environnement
1. Allez dans votre projet Railway
2. Cliquez sur le service **backend**
3. Allez à l'onglet **Variables**
4. Ajoutez toutes les variables de `backend/.env.example`:

```
NODE_ENV = production
PORT = 5000
JWT_SECRET = your-super-secret-key-change-this
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = your-email@gmail.com
SMTP_PASSWORD = your-app-password
SMTP_FROM = noreply@bygagoos.com
MAX_FILE_SIZE = 10485760
UPLOAD_DIR = /app/uploads
CORS_ORIGIN = https://your-vercel-frontend-url.vercel.app
```

**Important**: 
- `MONGODB_URI` est ajouté automatiquement
- Remplacez `CORS_ORIGIN` par votre URL Vercel réelle

### Étape 5: Obtenir l'URL du backend
1. Allez à votre projet Railway
2. Cliquez sur le service **backend**
3. L'URL publique est affichée en haut à droite
4. Format: `https://your-app-name.railway.app`

### Étape 6: Mettre à jour la variable Vercel
1. Retournez sur Vercel
2. Allez à **Settings → Environment Variables**
3. Mettez à jour: `VITE_API_URL = https://your-app-name.railway.app/api`
4. **Redeploy** le frontend

---

## Phase 4: Configuration Finale

### Test des APIs
```bash
# Test de santé du backend
curl https://your-app-name.railway.app/api/health

# Test de login
curl -X POST https://your-app-name.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### Configuration Email (Optional)
Pour que l'email fonctionne:
1. Créez un compte Gmail
2. Générez un [App Password](https://support.google.com/accounts/answer/185833)
3. Mettez à jour dans Railway:
   - `SMTP_USER` = votre email Gmail
   - `SMTP_PASSWORD` = votre App Password

### Configuration du domaine personnalisé
**Vercel**:
1. Settings → Domains
2. Ajoutez votre domaine (ex: ink.company.com)
3. Ajoutez les DNS records CNAME

**Railway**:
1. Services → Backend → Settings
2. Custom Domain → Ajoutez votre domaine API
3. Suivez les instructions DNS

---

## Phase 5: Monitoring & Maintenance

### Logs
**Vercel**: Settings → Git Logs ou Deployments
**Railway**: Services → Backend → Logs

### Redéploiement rapide
```bash
# Depuis votre machine locale
git push origin main
# Vercel et Railway redéployent automatiquement!
```

### Secrets sécurisés
Ne commettez JAMAIS:
- ✅ `.env` (ignoré par .gitignore)
- ✅ Tokens/Clés (stockés dans Railway/Vercel)

---

## Dépannage

| Problème | Solution |
|----------|----------|
| CORS Error | Vérifiez `CORS_ORIGIN` dans Railway |
| "MongoDB connection timeout" | Vérifiez connection string et IP whitelist MongoDB Atlas |
| "Cannot find module" | Exécutez `npm install` dans le dossier concerné |
| Email ne fonctionne pas | Vérifiez SMTP_PASSWORD avec [App Password Gmail](https://support.google.com/accounts/answer/185833) |
| Frontend affiche "Cannot reach API" | L'URL API Vercel n'est pas à jour |

---

## Résumé des URLs Production
- **Frontend**: https://your-vercel-domain.vercel.app
- **API Backend**: https://your-railway-domain.railway.app/api
- **MongoDB**: Hosted on Railway (pas d'accès direct)

---

## Automatisation Future
Vous pouvez automatiser:
- Migrations DB au déploiement
- Notifications Slack au déploiement
- Tests avant déploiement (CI/CD)

Consultez les docs:
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)

