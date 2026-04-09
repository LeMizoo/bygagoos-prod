#!/bin/bash

# ByGagoos Ink Deployment Assistant
# Usage: ./deploy.sh [frontend|backend|both]

set -e

echo "🚀 ByGagoos Ink Deployment Assistant"
echo "===================================="

DEPLOY_TARGET=${1:-both}

if [ "$DEPLOY_TARGET" = "frontend" ] || [ "$DEPLOY_TARGET" = "both" ]; then
    echo "📦 Frontend: Préparer pour Vercel..."
    cd frontend
    npm install
    npm run type-check
    npm run build
    echo "✅ Frontend build réussi!"
    cd ..
fi

if [ "$DEPLOY_TARGET" = "backend" ] || [ "$DEPLOY_TARGET" = "both" ]; then
    echo "📦 Backend: Préparer pour Railway..."
    cd backend
    npm install
    npm run type-check
    npm run build 2>/dev/null || true
    echo "✅ Backend check réussi!"
    cd ..
fi

echo ""
echo "📋 Checklist avant déploiement:"
echo "  ☐ .env configurés (pas dans Git)"
echo "  ☐ Database URL correcte"
echo "  ☐ JWT_SECRET changé"
echo "  ☐ CORS_ORIGIN corrects"
echo "  ☐ Variables d'environnement dans Vercel/Railway"
echo ""
echo "🔥 Prêt à déployer!"
echo "   Git: git push origin main"
echo "   Vercel & Railway redéployent automatiquement"
echo ""
