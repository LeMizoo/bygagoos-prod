@echo off
echo 🚀 Démarrage sécurisé du backend
echo ===============================

:: Libérer le port 5000
echo 🔍 Vérification du port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo 🗑️  Arrêt du processus PID: %%a
    taskkill /F /PID %%a 2>nul
)

:: Attendre que le port soit libre
timeout /t 2 /nobreak >nul

:: Démarrer l'application
echo ✅ Port 5000 libre
echo 🚀 Démarrage du serveur...
npm run dev