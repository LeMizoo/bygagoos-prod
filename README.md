# ByGagoos Prod

> Plateforme de gestion multi-activités pour ByGagoos Prod

## Description

ByGagoos Prod est une plateforme web complète qui regroupe trois activités complémentaires :
- **ByGagoos Ink** : Sérigraphie textile & design personnalisé
- **ByGagoos Trans** : Taxi-Moto & gestion de flotte
- **ByGagoos CDA** : Restaurant & Bar (Cuisine, Dégustation, Accueil)

La plateforme permet de gérer les produits, les commandes, les clients, les véhicules, les conducteurs, les réservations et la communication, tout en préservant nos valeurs familiales et notre excellence artisanale.

## Stack Technique

### Frontend

- React 18 avec TypeScript
- Tailwind CSS pour le design
- Vite comme build tool
- React Router pour la navigation
- Axios pour les appels API
- Lucide React pour les icônes
- Framer Motion pour les animations

### Backend

- Node.js avec Express
- TypeScript
- MongoDB avec Mongoose
- JWT pour l'authentification
- Bcrypt pour le hashing des mots de passe
- Joi pour la validation

### Déploiement

- Frontend : Vercel
- Backend : Render
- Base de données : MongoDB Atlas

## Installation

### Prérequis

- Node.js 18+
- MongoDB Compass (optionnel, pour visualiser la DB)
- Git

### Installation locale

1. Cloner le repository

```bash
git clone https://github.com/LeMizoo/bygagoos-prod.git
cd bygagoos-prod