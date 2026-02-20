# Guide de Démarrage - ByGagoos-Ink

## Bienvenue dans votre projet !

Ce guide va vous accompagner de A à Z pour créer votre plateforme de gestion artisanale.

---

## Phase 1 : Préparation de l'environnement (Jour 1 - 1er Nov)

### Étape 1.1 : Installation des outils nécessaires

Sur votre ordinateur, vous devez installer :

1. **Node.js** (version 18 ou supérieure)
   - Télécharger depuis : https://nodejs.org/
   - Vérifier l'installation : `node --version`

2. **Git** (pour le versioning)
   - Télécharger depuis : https://git-scm.com/
   - Vérifier l'installation : `git --version`

3. **MongoDB Compass** (pour visualiser votre base de données)
   - Télécharger depuis : https://www.mongodb.com/products/compass

4. **Un éditeur de code** (choisir un)
   - VS Code (recommandé) : https://code.visualstudio.com/
   - Cursor : https://cursor.sh/

### Étape 1.2 : Créer les comptes cloud (GRATUIT)

1. **GitHub** : https://github.com/
   - Pour héberger votre code

2. **Vercel** : https://vercel.com/
   - Pour héberger le frontend (site web)
   - Se connecter avec votre compte GitHub

3. **MongoDB Atlas** : https://www.mongodb.com/cloud/atlas
   - Pour héberger votre base de données
   - Plan gratuit : M0 (512 MB)

4. **Railway** : https://railway.app/
   - Pour héberger le backend (API)
   - Se connecter avec votre compte GitHub

---

## Phase 2 : Structure du projet

Voici l'architecture complète de votre projet :

```
bygagoos-ink/
├── frontend/                 # Application React (Interface utilisateur)
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   ├── pages/           # Pages de l'application
│   │   ├── hooks/           # Custom hooks React
│   │   ├── services/        # Appels API
│   │   ├── context/         # Context API pour l'état global
│   │   ├── types/           # Types TypeScript
│   │   └── utils/           # Fonctions utilitaires
│   ├── public/              # Fichiers statiques (images, etc.)
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/                  # API Node.js/Express
│   ├── src/
│   │   ├── models/          # Schémas MongoDB (Mongoose)
│   │   ├── routes/          # Routes de l'API
│   │   ├── controllers/     # Logique métier
│   │   ├── middlewares/     # Middlewares (auth, validation, etc.)
│   │   ├── config/          # Configuration (DB, JWT, etc.)
│   │   └── utils/           # Fonctions utilitaires
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                 # Variables d'environnement (NE PAS COMMIT)
│
├── .gitignore               # Fichiers à ignorer par Git
├── README.md                # Documentation du projet
└── GUIDE_DEMARRAGE.md       # Ce fichier
```

---

## Phase 3 : Initialisation du projet (Jour 1)

### Étape 3.1 : Créer le repository GitHub

1. Aller sur https://github.com/new
2. Nom du repository : `bygagoos-ink`
3. Description : "Plateforme de gestion pour atelier artisanal familial"
4. Visibilité : Private (pour commencer)
5. Cliquer sur "Create repository"

### Étape 3.2 : Initialiser Git localement

Dans votre terminal :

```bash
cd bygagoos-ink
git init
git branch -M main
git remote add origin https://github.com/VOTRE-USERNAME/bygagoos-ink.git
```

### Étape 3.3 : Créer la structure des dossiers

```bash
mkdir frontend backend
```

---

## Phase 4 : Configuration MongoDB Atlas (Jour 1)

### Étape 4.1 : Créer un cluster

1. Se connecter sur https://cloud.mongodb.com/
2. Cliquer sur "Build a Database"
3. Choisir "M0 FREE" (512MB)
4. Région : Choisir la plus proche (ex: Frankfurt, Germany)
5. Nom du cluster : `bygagoos-cluster`
6. Cliquer sur "Create"

### Étape 4.2 : Configurer l'accès

1. **Créer un utilisateur de base de données**
   - Username : `bygagoos_admin`
   - Password : Générer un mot de passe fort (le sauvegarder !)

2. **Configurer l'accès réseau**
   - Ajouter l'IP : `0.0.0.0/0` (permet l'accès depuis n'importe où)
   - Cliquer sur "Add Entry"

### Étape 4.3 : Obtenir la connection string

1. Cliquer sur "Connect" sur votre cluster
2. Choisir "Drivers"
3. Copier la connection string (ressemble à) :
   ```
   mongodb+srv://bygagoos_admin:<password>@bygagoos-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Remplacer `<password>` par votre mot de passe

---

## Phase 5 : Setup Backend (Jour 1-2)

### Étape 5.1 : Initialiser le projet Node.js

```bash
cd backend
npm init -y
```

### Étape 5.2 : Installer les dépendances

```bash
# Dépendances principales
npm install express mongoose dotenv cors bcrypt jsonwebtoken

# Dépendances de développement
npm install -D typescript @types/node @types/express @types/cors @types/bcrypt @types/jsonwebtoken ts-node nodemon

# Validation
npm install joi
```

### Étape 5.3 : Configuration TypeScript

Créer `tsconfig.json` :
(Je vais créer tous les fichiers de configuration pour vous)

---

## Phase 6 : Setup Frontend (Jour 2)

### Étape 6.1 : Créer le projet React avec Vite

```bash
cd ../frontend
npm create vite@latest . -- --template react-ts
```

### Étape 6.2 : Installer les dépendances

```bash
# Dépendances principales
npm install react-router-dom axios

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Icônes Lucide React
npm install lucide-react
```

---

## Phase 7 : Premier déploiement (Jour 3-4)

### Backend sur Railway
1. Connecter votre compte GitHub sur Railway
2. Créer un nouveau projet
3. Déployer depuis GitHub : sélectionner le dossier `backend`
4. Ajouter les variables d'environnement
5. Déployer !

### Frontend sur Vercel
1. Connecter votre compte GitHub sur Vercel
2. Importer le projet
3. Sélectionner le dossier `frontend`
4. Ajouter les variables d'environnement
5. Déployer !

---

## Prochaines étapes

Une fois l'environnement prêt, nous allons créer :

1. **Jour 2-3** : Modèles MongoDB (User, Product, Order)
2. **Jour 4-5** : Routes API (Auth, Users, Products)
3. **Jour 6-7** : Pages React (Login, Dashboard)
4. **Jour 8-10** : Connexion Frontend <-> Backend
5. **Jour 11-14** : Fonctionnalités avancées

---

## Commandes utiles

### Backend
```bash
cd backend
npm run dev          # Lancer en mode développement
npm run build        # Compiler TypeScript
npm start            # Lancer en production
```

### Frontend
```bash
cd frontend
npm run dev          # Lancer en mode développement
npm run build        # Build pour production
npm run preview      # Preview du build
```

### Git
```bash
git status           # Voir les changements
git add .            # Ajouter tous les fichiers
git commit -m "..."  # Créer un commit
git push             # Envoyer sur GitHub
```

---

## Support

En cas de problème :
- Tovoniaina : +261 34 43 593 30
- Email : positifaid@live.fr
- Groupe WhatsApp familial

---

## Ressources

- Documentation React : https://react.dev/
- Documentation TypeScript : https://www.typescriptlang.org/
- Documentation MongoDB : https://www.mongodb.com/docs/
- Documentation Tailwind : https://tailwindcss.com/docs

---

**Prêt à commencer ? Passons à la création des fichiers de configuration !**
