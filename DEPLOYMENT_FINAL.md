# 🚀 Guide de Déploiement Final

## ✅ Statut
- **Backend**: Déployé sur Render → https://bygagoos-prod.onrender.com
- **Frontend**: Prêt pour Vercel
- **Repo**: https://github.com/LeMizoo/bygagoos-prod

## 📋 Étapes Restantes

### 1. Déployer le Frontend sur Vercel
1. Aller sur [vercel.com](https://vercel.com)
2. "New Project" → Importer `LeMizoo/bygagoos-prod`
3. Configuration :
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Environment Variables**:
     ```
     VITE_API_URL=https://bygagoos-prod.onrender.com/api
     ```

### 2. Variables d'Environnement Backend (Render)
Dans le dashboard Render, ajouter ces variables :
```
MONGODB_URI=votre-connexion-mongodb-atlas
REDIS_URL=votre-url-redis-upstash
SMTP_USER=votre-email-gmail
SMTP_PASSWORD=votre-mot-de-passe-app-gmail
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret
```

### 3. Mise à Jour Finale
Une fois le frontend déployé sur Vercel (ex: `https://bygagoos-prod.vercel.app`) :
- Mettre à jour Render : `ALLOWED_ORIGINS` et `FRONTEND_URL` avec l'URL Vercel
- Redéployer le backend sur Render

## 🔗 URLs Attendues
- **Frontend**: https://bygagoos-prod.vercel.app
- **Backend API**: https://bygagoos-prod.onrender.com/api

## ✅ Tests Post-Déploiement
1. Vérifier la connexion frontend ↔ backend
2. Tester l'authentification
3. Vérifier les uploads Cloudinary
4. Tester les emails SMTP

---
*Généré le 10 avril 2026*</content>
<parameter name="filePath">d:\ByGagoos-ink\DEPLOYMENT_FINAL.md