// frontend/src/api/axiosInstance.ts

import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import authApi from "./auth.api";
import { API_URL } from "./index";
import dev from "../utils/devLogger";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
  withCredentials: false, // Modifié: false pour éviter conflits CORS (les tokens sont envoyés via l'en-tête)
});

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

// 🔑 Récupération fiable du token
const getToken = () => {
  return localStorage.getItem("token") || localStorage.getItem("accessToken") || useAuthStore.getState().token;
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      dev.log(`🔐 Token ajouté à ${config.url}`);
    } else {
      dev.log(`⚠️ Aucun token pour ${config.url}`);
    }

    // ❌ Suppression de la logique incorrecte qui retirait '/api' de l'URL.
    // La baseURL contient déjà l'adresse complète du backend, donc on utilise l'url telle quelle.
    // Si jamais vous avez un souci de double /api, vérifiez plutôt la définition de API_URL.
    
    dev.log(`📡 Requête API: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    dev.log(`✅ Réponse API: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      dev.error(`❌ Erreur API ${error.response.status}:`, {
        url: originalRequest?.url,
        method: originalRequest?.method,
        data: error.response.data,
        status: error.response.status
      });
    }

    // Gestion 401 - Token expiré ou manquant
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('Pas de refresh token');
        }

        dev.log('🔄 Token expiré, tentative de rafraîchissement...');
        
        const response = await authApi.refreshToken(refreshToken);
        
        // Stockage des nouveaux tokens
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('accessToken', response.accessToken);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }

        // Mise à jour du store
        const store = useAuthStore.getState();
        if (store.token) {
          store.token = response.accessToken;
        }

        dev.log('✅ Token rafraîchi avec succès');
        
        onRefreshed(response.accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        dev.error('❌ Échec du rafraîchissement du token:', refreshError);
        
        // Nettoyage complet
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        useAuthStore.getState().clearAuth();
        
        window.location.href = "/auth/login";
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 403) {
      dev.log('⛔ Accès interdit');
      window.location.href = "/unauthorized";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
export { axiosInstance };