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
  withCredentials: false,
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

// Interface pour les tokens JWT décodés
interface DecodedToken {
  exp: number;
}

// 🔄 Vérifier si le token est expiré
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as DecodedToken;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// 🛡️ Garder la session active avec un keep-alive silencieux
let keepAliveInterval: ReturnType<typeof setInterval> | null = null;

const startKeepAlive = (): void => {
  if (keepAliveInterval) clearInterval(keepAliveInterval);
  
  keepAliveInterval = setInterval(async () => {
    const token = getToken();
    if (token && !isTokenExpired(token)) {
      try {
        await axiosInstance.get('/auth/me', { _silent: true } as { _silent: boolean });
        dev.log('💓 Session keep-alive réussi');
      } catch {
        dev.log('⚠️ Keep-alive échoué, token peut-être bientôt expiré');
      }
    }
  }, 10 * 60 * 1000); // Toutes les 10 minutes
};

// Arrêter le keep-alive (appeler à la déconnexion)
export const stopKeepAlive = (): void => {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
};

// Démarrer le keep-alive après connexion
export const initKeepAlive = (): void => {
  const token = getToken();
  if (token && !isTokenExpired(token)) {
    startKeepAlive();
  }
};

axiosInstance.interceptors.request.use(
  (config) => {
    // Ne pas ajouter de token pour les requêtes silencieuses
    if ((config as { _silent?: boolean })._silent) {
      return config;
    }

    const token = getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      dev.log(`🔐 Token ajouté à ${config.url}`);
    } else {
      dev.log(`⚠️ Aucun token pour ${config.url}`);
    }
    
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

    // Ne pas tenter de refresh pour les requêtes silencieuses
    if ((originalRequest as { _silent?: boolean })?._silent) {
      return Promise.reject(error);
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

        // Redémarrer le keep-alive avec le nouveau token
        startKeepAlive();

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
        
        // Arrêter le keep-alive
        stopKeepAlive();
        
        // Rediriger vers login
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

// Démarrer le keep-alive au chargement si un token existe
if (typeof window !== 'undefined') {
  const token = getToken();
  if (token && !isTokenExpired(token)) {
    startKeepAlive();
  }
}

export default axiosInstance;
export { axiosInstance };