#!/bin/bash
echo "⚡ TEST DE PERFORMANCE"

# Backend
echo "Backend:"
curl -w "  Statut: %{http_code}\n  Temps: %{time_total}s\n" -o /dev/null -s https://bygagoos-prod.onrender.com/health

# Frontend
echo "Frontend:"
curl -w "  Statut: %{http_code}\n  Temps: %{time_total}s\n" -o /dev/null -s https://bygagoos-prod.vercel.app

# API spécifiques
echo "API Taxi:"
curl -w "  Temps: %{time_total}s\n" -o /dev/null -s https://bygagoos-prod.onrender.com/api/taxi/stats

echo "API Restaurant:"
curl -w "  Temps: %{time_total}s\n" -o /dev/null -s https://bygagoos-prod.onrender.com/api/restaurant/stats