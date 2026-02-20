# ByGagoos-Ink

> Plateforme de gestion pour atelier artisanal familial

## Description

ByGagoos-Ink est une application web complète pour gérer notre atelier artisanal familial. Elle permet de gérer les produits, les commandes, les clients et la communication, tout en préservant nos valeurs familiales et notre excellence artisanale.

## Stack Technique

### Frontend
- React 18 avec TypeScript
- Tailwind CSS pour le design
- Vite comme build tool
- React Router pour la navigation
- Axios pour les appels API
- Lucide React pour les icônes

### Backend
- Node.js avec Express
- TypeScript
- MongoDB avec Mongoose
- JWT pour l'authentification
- Bcrypt pour le hashing des mots de passe
- Joi pour la validation

### Déploiement
- Frontend : Vercel
- Backend : Railway
- Base de données : MongoDB Atlas

## Installation

### Prérequis
- Node.js 18+
- MongoDB Compass (optionnel, pour visualiser la DB)
- Git

### Installation locale

1. Cloner le repository
```bash
git clone https://github.com/VOTRE-USERNAME/bygagoos-ink.git
cd bygagoos-ink
```

2. Installer le backend
```bash
cd backend
npm install
cp .env.example .env  # Puis configurer les variables
npm run dev
```

3. Installer le frontend
```bash
cd ../frontend
npm install
npm run dev
```

## Structure du projet

```
bygagoos-ink/
├── frontend/           # Application React
├── backend/            # API Node.js/Express
├── GUIDE_DEMARRAGE.md  # Guide détaillé
└── README.md           # Ce fichier
```

## Fonctionnalités

### Phase 1 (Novembre 2025)
- [x] Authentification JWT
- [x] Gestion des utilisateurs (4 rôles)
- [ ] Dashboard familial
- [ ] Gestion des produits

### Phase 2 (Décembre 2025)
- [ ] Module Production
- [ ] Contrôle Qualité
- [ ] Gestion des stocks

### Phase 3 (Janvier 2026)
- [ ] Portail Client
- [ ] Suivi des commandes
- [ ] Notifications

### Phase 4 (Février 2026)
- [ ] Gestion Financière
- [ ] Rapports et statistiques

## Équipe

- **Tovoniaina RAHENDRISON** - Super Admin & Infrastructure
- **Volatiana RANDRIANARISOA** - Admin Inspiration & Créativité
- **Miantsatiana RAHENDRISON** - Admin Production & Design
- **Tia Faniry RAHENDRISON** - Admin Communication & Relations

## Variables d'environnement

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=votre_secret_tres_long_et_securise
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Scripts disponibles

### Backend
```bash
npm run dev      # Développement avec hot reload
npm run build    # Compiler TypeScript
npm start        # Production
## 🚀 Redis Integration

### Prérequis
- Redis (local, Docker, ou Memurai sur Windows)

### Installation

#### Option 1: Redis local (Linux/Mac)
```bash
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# MacOS
brew install redis
brew services start redis

```

### Frontend
```bash
npm run dev      # Développement
npm run build    # Build production
npm run preview  # Preview du build
```

## Contribution

Ce projet est privé et réservé à la famille ByGagoos.

## Support

- Tovoniaina : +261 34 43 593 30
- Email : positifaid@live.fr

## Licence

Propriétaire - ByGagoos Family © 2025

---

**« Tout doit se faire avec bienséance et avec ordre. » - 1 Corinthiens 14:40**
# bygagoos-final
# bygagoos-final
