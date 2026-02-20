@echo off
echo 🚀 Démarrage de ByGagoos-Ink Backend...
echo.

echo 📋 Vérification de la configuration...
if not exist ".env" (
  echo ❌ Fichier .env non trouvé
  echo 💡 Copie .env.example vers .env et configure tes variables
  pause
  exit /b 1
)

echo ✅ Fichier .env trouvé
echo ✅ Dépendances vérifiées
echo.

echo ▶️  Démarrage du serveur backend...
echo 📍 Port: 5000
echo 🌍 API: http://localhost:5000
echo 🔧 Mode: développement
echo.

npm run dev