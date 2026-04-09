// frontend/src/api/client.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

import dev from "../utils/devLogger"; dev.log("🌐 API Client configuré avec URL:", API_URL);

// Instance Axios principale
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// =============================
// REQUEST INTERCEPTOR
// =============================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    dev.error("❌ Erreur dans la requête API:", error);
    return Promise.reject(error);
  }
);

// =============================
// RESPONSE INTERCEPTOR
// =============================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Si erreur 401 et pas encore tenté
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        logoutUser();
        return Promise.reject(error);
      }

      try {
        dev.log("🔄 Tentative de rafraîchissement du token...");
        dev.log("🔄 Tentative de rafraîchissement du token...");

        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const accessToken =
          response.data?.data?.accessToken || response.data?.accessToken;

        if (!accessToken) {
          throw new Error("Token invalide");
        }

        dev.log("✅ Nouveau token obtenu");
        dev.log("✅ Nouveau token obtenu");

        localStorage.setItem("token", accessToken);
        localStorage.setItem("accessToken", accessToken);

        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        dev.error("❌ Échec du rafraîchissement:", refreshError);

        processQueue(refreshError, null);

        dev.error("❌ Échec du rafraîchissement:", refreshError); logoutUser();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// =============================
// LOGOUT CENTRALISÉ
// =============================

function logoutUser() {
  dev.warn("🚪 Déconnexion utilisateur");
  dev.warn("🚪 Déconnexion utilisateur");

  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  if (window.location.pathname !== "/auth/login") {
    window.location.href = "/auth/login";
  }
}

export default api;