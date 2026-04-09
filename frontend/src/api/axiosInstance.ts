// frontend/src/api/axiosInstance.ts

import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import authApi from "./auth.api";
import dev from "../utils/devLogger";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
  withCredentials: true,
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

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken") || useAuthStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ CORRIGÉ: Éviter les doubles /api
    if (config.url?.startsWith('/api/')) {
      config.url = config.url.substring(4);
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

    // Gestion 401 - Token expiré
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
        
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('accessToken', response.accessToken);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }

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