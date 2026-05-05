// frontend/src/api/index.ts

// Déterminer l'URL de l'API de manière robuste
const getApiUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;

  // 1. Priorité à la variable d'environnement, mais on corrige le cas
  //    d'un /api relatif utilisé sur Vercel en production.
  if (envUrl) {
    if (envUrl === "/api" && window.location.hostname.endsWith("vercel.app")) {
      return "https://bygagoos-prod.onrender.com/api";
    }

    return envUrl;
  }

  // 2. Fallback prod connu
  if (window.location.hostname.endsWith("vercel.app")) {
    return "https://bygagoos-prod.onrender.com/api";
  }

  // 3. Fallback : construction à partir de l'origine (port 5000)
  const origin = window.location.origin; // http://localhost:3000
  const baseUrl = origin.replace(":3000", ":5000"); // http://localhost:5000
  return `${baseUrl}/api`;
};

export const API_URL = getApiUrl();

import { dev } from '../utils/devLogger';

dev.log("✅ API_URL configured:", API_URL);

// Récupérer les headers d'authentification
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fonction fetch générique
export const apiFetch = async <T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ data: T; success: boolean; message?: string }> => {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options.headers,
    } as Record<string, string>;

    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_URL}${endpoint}`;
    
    dev.log(`📡 API Fetch: ${options.method || "GET"} ${url}`);
    
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
        throw new Error("Session expirée. Veuillez vous reconnecter.");
      }

      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const data = await response.json();
      return {
        data: data.data || data,
        success: data.success !== false,
        message: data.message,
      };
    } else {
      const text = await response.text();
      return {
        data: text as T,
        success: true,
      };
    }
  } catch (error: any) {
    dev.error("❌ API Fetch Error:", { endpoint, error: error.message });
    return {
      data: null as T,
      success: false,
      message: error.message || "Erreur réseau",
    };
  }
};

// Upload de fichier
export const uploadFile = async (
  file: File,
  endpoint: string = "/upload",
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) throw new Error("Upload failed");
  const data = await response.json();
  return data.url || data.fileUrl;
};
