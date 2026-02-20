@echo off
cd /d "%~dp0"
echo Starting ByGagoos-Ink Backend...
node --version
npm --version
echo.
npm run dev
pause
