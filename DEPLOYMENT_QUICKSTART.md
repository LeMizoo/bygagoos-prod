# 🎯 Quickstart Deployment Checklist

## ✅ Completed
- [x] Code poussé vers GitHub: **https://github.com/LeMizoo/bygagoos-prod**
- [x] Frontend `vercel.json` créé
- [x] Backend `railway.json` créé
- [x] Guide complet: `DEPLOYMENT_GUIDE.md`

---

## 📋 Next Steps (À faire maintenant)

### 1️⃣ Créez MongoDB Atlas (5 min)
```
1. Allez à https://www.mongodb.com/cloud/atlas
2. Sign up (gratuit)
3. Créez un cluster M0 (gratuit)
4. Obtenez la connection string: mongodb+srv://...
```

### 2️⃣ Déployez le Backend sur Railway (5 min)
```
1. Allez à https://railway.app
2. Login avec GitHub
3. New Project → Deploy from GitHub repo
4. Sélectionnez: bygagoos-prod (branch: main)
5. Root directory: backend/
6. Railway crée MongoDB auto
7. Ajoutez les variables .env
8. Copiez l'URL: https://your-app.railway.app
```

### 3️⃣ Déployez le Frontend sur Vercel (5 min)
```
1. Allez à https://vercel.com
2. Login avec GitHub
3. New Project → Sélectionnez: bygagoos-prod
4. Framework: React ✓
5. Root directory: frontend/
6. Deploy!
7. Environment Variable: VITE_API_URL = https://your-app.railway.app/api
8. Redeploy
```

### 4️⃣ Testez les APIs
```bash
# Health check
curl https://your-app.railway.app/api/health

# Test login
curl -X POST https://your-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'
```

---

## 🚀 Production URLs
- **Frontend**: https://your-vercel-domain.vercel.app
- **API Backend**: https://your-railway-domain.railway.app/api
- **GitHub**: https://github.com/LeMizoo/bygagoos-prod

---

## 💡 Important Notes
- ✅ `.env` files are **ignored** (not in Git)
- ✅ Railway & Vercel watch for `git push origin main`
- ✅ Auto-redeploy on every push
- ⚠️ MongoDB is included free on Railway

---

## 📚 Full Guide
See `DEPLOYMENT_GUIDE.md` for detailed instructions, troubleshooting, and features.

---

## 🆘 Quick Troubleshooting
| Issue | Fix |
|-------|-----|
| CORS Error | Check `CORS_ORIGIN` env var in Railway |
| "Cannot reach API" | Vercel `VITE_API_URL` might be wrong - redeploy |
| MongoDB timeout | Whitelist IP on MongoDB Atlas |
| Email not working | Use [Gmail App Password](https://support.google.com/accounts/answer/185833) |

---

**You're ready to deploy! 🚀**
