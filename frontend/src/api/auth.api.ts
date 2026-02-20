import { API_URL, getAuthHeaders } from "./index";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;  // Changé de 'token' à 'accessToken' pour correspondre au backend
  refreshToken: string; // Ajouté
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface UserProfile {
  _id: string;
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  role: string;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Gestionnaire de rafraîchissement de token pour éviter les appels concurrents
let refreshPromise: Promise<RefreshTokenResponse> | null = null;

// Fetch wrapper avec gestion d'erreur améliorée
const fetchApi = async <T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> => {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...options.headers,
  } as Record<string, string>;

  const url = `${API_URL}${endpoint}`;
  console.log(`🌐 Auth API Request: ${options.method || "GET"} ${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    // Gestion du token expiré (401)
    if (response.status === 401 && retryCount === 0) {
      console.log('🔄 Token expiré, tentative de rafraîchissement...');
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const newTokens = await authApi.refreshToken(refreshToken);
          
          // Mettre à jour les tokens
          localStorage.setItem('token', newTokens.accessToken);
          if (newTokens.refreshToken) {
            localStorage.setItem('refreshToken', newTokens.refreshToken);
          }
          
          // Réessayer avec le nouveau token
          const newHeaders = {
            ...options.headers,
            Authorization: `Bearer ${newTokens.accessToken}`
          };
          
          return fetchApi(endpoint, { ...options, headers: newHeaders }, retryCount + 1);
        }
      } catch (refreshError) {
        console.error('❌ Échec du rafraîchissement du token:', refreshError);
        // Rediriger vers login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
        throw new Error('Session expirée, veuillez vous reconnecter');
      }
    }

    if (!response.ok) {
      let errorData: any = { message: "Erreur inconnue" };
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          message: `Erreur HTTP ${response.status}: ${response.statusText}`,
        };
      }
      console.error(`❌ Auth API Error (${response.status}):`, errorData);
      throw new Error(errorData.message || `Erreur: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Auth API Success:`, data);
    return data;
  } catch (error) {
    console.error('❌ Fetch error:', error);
    throw error;
  }
};

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetchApi<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    
    console.log('📦 Réponse brute du login:', response);
    
    if (response.success && response.data) {
      // Adapter la réponse au format attendu
      const authResponse: AuthResponse = {
        user: {
          ...response.data.user,
          id: response.data.user.id || response.data.user._id,
        },
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken
      };
      
      // Sauvegarder les tokens
      localStorage.setItem('token', authResponse.accessToken);
      localStorage.setItem('refreshToken', authResponse.refreshToken);
      localStorage.setItem('user', JSON.stringify(authResponse.user));
      
      return authResponse;
    }
    
    throw new Error(response.message || "Erreur de connexion");
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await fetchApi<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    
    if (response.success && response.data) {
      const authResponse: AuthResponse = {
        user: {
          ...response.data.user,
          id: response.data.user.id || response.data.user._id,
        },
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken
      };
      
      localStorage.setItem('token', authResponse.accessToken);
      localStorage.setItem('refreshToken', authResponse.refreshToken);
      localStorage.setItem('user', JSON.stringify(authResponse.user));
      
      return authResponse;
    }
    
    throw new Error(response.message || "Erreur d'inscription");
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    // Éviter les appels concurrents
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        console.log('🔄 Rafraîchissement du token...');
        
        const response = await fetchApi<any>("/auth/refresh-token", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        });

        if (response.success && response.data) {
          console.log('✅ Token rafraîchi avec succès');
          return response.data;
        }

        throw new Error(response.message || "Erreur de rafraîchissement");
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },

  getMe: async (token: string): Promise<{ user: UserProfile }> => {
    const response = await fetchApi<any>("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (response.success && response.data) {
      return {
        user: {
          ...response.data.user,
          id: response.data.user.id || response.data.user._id,
        }
      };
    }
    
    throw new Error(response.message || "Erreur de récupération du profil");
  },

  checkAuth: async (): Promise<{ user: UserProfile }> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Non authentifié");
    return authApi.getMe(token);
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await fetchApi<any>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    
    if (response.success) {
      return { message: response.message };
    }
    
    throw new Error(response.message || "Erreur");
  },

  resetPassword: async (
    token: string,
    password: string,
  ): Promise<{ message: string }> => {
    const response = await fetchApi<any>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
    
    if (response.success) {
      return { message: response.message };
    }
    
    throw new Error(response.message || "Erreur");
  },

  logout: async (): Promise<{ message: string }> => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    
    if (!token) return { message: "Déjà déconnecté" };
    
    try {
      const response = await fetchApi<any>("/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      return { message: response.message || "Déconnexion réussie" };
    } finally {
      // Nettoyer le localStorage même si la requête échoue
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('auth-storage');
    }
  },

  updateProfile: async (
    data: Partial<UserProfile>,
  ): Promise<{ user: UserProfile }> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Non authentifié");
    
    const response = await fetchApi<any>("/users/me/profile", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    if (response.success && response.data) {
      return {
        user: {
          ...response.data.user,
          id: response.data.user.id || response.data.user._id,
        }
      };
    }
    
    throw new Error(response.message || "Erreur");
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<{ message: string }> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Non authentifié");
    
    const response = await fetchApi<any>("/users/me/password", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
    
    if (response.success) {
      return { message: response.message };
    }
    
    throw new Error(response.message || "Erreur");
  },

  healthCheck: async (): Promise<any> => {
    return fetchApi("/health", { method: "GET" });
  },

  getVersion: async (): Promise<any> => {
    return fetchApi("/version", { method: "GET" });
  },
};

export default authApi;