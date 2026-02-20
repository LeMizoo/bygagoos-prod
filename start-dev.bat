@echo off
echo 🚀 Démarrage de l'environnement de développement ByGagoos-Ink
echo.

:: Vérifier si Redis est installé localement (Memurai)
echo 🔍 Vérification de Redis...
redis-cli ping >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Redis n'est pas accessible.
    echo.
    echo Options:
    echo 1. Démarrer Memurai (si installé)
    echo 2. Démarrer Redis dans Docker
    echo 3. Continuer sans Redis (mode dégradé)
    echo.
    set /p choice="Choisissez une option (1/2/3): "
    
    if "%choice%"=="1" (
        echo 🔄 Démarrage de Memurai...
        net start Memurai >nul 2>&1 || echo ❌ Memurai non installé ou impossible à démarrer
    )
    if "%choice%"=="2" (
        echo 🐳 Démarrage de Redis dans Docker...
        docker run -d --name redis-bygagoos -p 6379:6379 redis:alpine
    )
    if "%choice%"=="3" (
        echo ⚠️ Démarrage sans Redis (mode dégradé)
    )
) else (
    echo ✅ Redis est accessible
)

echo.
echo 🔧 Démarrage du backend...
cd backend
npm run dev