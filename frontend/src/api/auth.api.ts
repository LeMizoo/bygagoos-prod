// frontend/src/api/auth.api.ts

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

export interface UpdateProfileData {
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  address?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserProfile {
  _id?: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  role: string;
  avatar?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  dashboardPath?: string;
  department?: string | null;
  position?: string | null;
  familyAccess?: string[];
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface GoogleAuthConfig {
  clientId: string;
  enabled: boolean;
  superAdminEmail: string;
}

// Gestionnaire de rafraîchissement de token pour éviter les appels concurrents
let refreshPromise: Promise<RefreshTokenResponse> | null = null;

// Fetch wrapper avec gestion d'erreur améliorée
const fetchApi = async <T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> => {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...options.headers,
  } as Record<string, string>;

  const url = `${API_URL}${normalizedEndpoint}`;

  const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    // Gestion du token expiré (401)
    if (response.status === 401 && retryCount === 0 && !endpoint.includes('/login')) {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      
      if (storedRefreshToken) {
        try {
          const newTokens = await authApi.refreshToken(storedRefreshToken);
          
          localStorage.setItem('token', newTokens.accessToken);
          localStorage.setItem('accessToken', newTokens.accessToken);
          if (newTokens.refreshToken) {
            localStorage.setItem('refreshToken', newTokens.refreshToken);
          }

          const newHeaders = {
            ...options.headers,
            Authorization: `Bearer ${newTokens.accessToken}`
          };

          return fetchApi<T>(endpoint, { ...options, headers: newHeaders }, retryCount + 1);
        } catch (refreshError) {
          authApi.clearLocalAuth();
          window.location.href = '/auth/login';
          throw new Error('Session expirée, veuillez vous reconnecter');
        }
      }
    }

    if (!response.ok) {
      let errorData: Record<string, unknown> = { message: "Erreur inconnue" };
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `Erreur HTTP ${response.status}: ${response.statusText}` };
      }
      throw new Error((errorData.message as string) || (errorData.error as string) || `Erreur: ${response.status}`);
    }

  return await response.json();
};

export const authApi = {
  clearLocalAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetchApi<{ success: boolean; data?: { user: UserProfile; token?: string; accessToken?: string; refreshToken?: string }; message?: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    
    if (response.success && response.data) {
      const userData = response.data.user;
      const authResponse: AuthResponse = {
        user: {
          ...userData,
          id: userData.id || userData._id as string,
          firstName: userData.firstName || userData.name?.split(' ')[0] || '',
          lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
        },
        accessToken: response.data.token || response.data.accessToken || '',
        refreshToken: response.data.refreshToken || ''
      };
      
      localStorage.setItem('token', authResponse.accessToken);
      localStorage.setItem('accessToken', authResponse.accessToken);
      localStorage.setItem('refreshToken', authResponse.refreshToken);
      localStorage.setItem('user', JSON.stringify(authResponse.user));
      
      return authResponse;
    }
    throw new Error(response.message || "Erreur de connexion");
  },

  googleConfig: async (): Promise<GoogleAuthConfig> => {
    const response = await fetchApi<{ success: boolean; data?: GoogleAuthConfig; message?: string }>("/auth/google", {
      method: "GET",
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Configuration Google indisponible");
  },

  googleLogin: async (credential: string): Promise<AuthResponse> => {
    const response = await fetchApi<{ success: boolean; data?: { user: UserProfile; accessToken?: string; refreshToken?: string; token?: string }; message?: string }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    });

    if (response.success && response.data) {
      const userData = response.data.user;
      const authResponse: AuthResponse = {
        user: {
          ...userData,
          id: userData.id || userData._id as string,
          firstName: userData.firstName || userData.name?.split(' ')[0] || '',
          lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
        },
        accessToken: response.data.accessToken || response.data.token || '',
        refreshToken: response.data.refreshToken || ''
      };

      localStorage.setItem('token', authResponse.accessToken);
      localStorage.setItem('accessToken', authResponse.accessToken);
      localStorage.setItem('refreshToken', authResponse.refreshToken);
      localStorage.setItem('user', JSON.stringify(authResponse.user));

      return authResponse;
    }

    throw new Error(response.message || "Erreur de connexion Google");
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await fetchApi<{ success: boolean; data?: { user: UserProfile; token?: string; accessToken?: string; refreshToken?: string }; message?: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    
    if (response.success && response.data) {
      const userData = response.data.user;
      const authResponse: AuthResponse = {
        user: {
          ...userData,
          id: userData.id || userData._id as string,
          firstName: userData.firstName || userData.name?.split(' ')[0] || '',
          lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
        },
        accessToken: response.data.token || response.data.accessToken || '',
        refreshToken: response.data.refreshToken || ''
      };
      
      localStorage.setItem('token', authResponse.accessToken);
      localStorage.setItem('accessToken', authResponse.accessToken);
      localStorage.setItem('refreshToken', authResponse.refreshToken);
      localStorage.setItem('user', JSON.stringify(authResponse.user));
      
      return authResponse;
    }
    throw new Error(response.message || "Erreur d'inscription");
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      try {
        const response = await fetchApi<{ success: boolean; data?: RefreshTokenResponse; message?: string }>("/auth/refresh-token", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        });

        if (response.success && response.data) return response.data;
        throw new Error(response.message || "Erreur de rafraîchissement");
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },

  getMe: async (token: string): Promise<{ user: UserProfile }> => {
    const response = await fetchApi<{ success: boolean; data?: { user: UserProfile }; message?: string }>("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (response.success && response.data) {
      const userData = response.data.user;
      return {
        user: {
          ...userData,
          id: (userData.id || userData._id) as string,
          firstName: userData.firstName || userData.name?.split(' ')[0] || '',
          lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
        }
      };
    }
    throw new Error(response.message || "Erreur de récupération du profil");
  },

  checkAuth: async (): Promise<{ user: UserProfile }> => {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (!token) throw new Error("Non authentifié");
    return authApi.getMe(token);
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await fetchApi<{ success: boolean; message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    if (response.success) return { message: response.message };
    throw new Error(response.message || "Erreur");
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const response = await fetchApi<{ success: boolean; message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
    if (response.success) return { message: response.message };
    throw new Error(response.message || "Erreur");
  },

  logout: async (): Promise<{ message: string }> => {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    
    if (!token) {
      authApi.clearLocalAuth();
      return { message: "Déjà déconnecté" };
    }
    
    try {
      const response = await fetchApi<{ message?: string }>("/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ refreshToken }),
      });
      return { message: response.message || "Déconnexion réussie" };
    } finally {
      authApi.clearLocalAuth();
    }
  },

  updateProfile: async (data: UpdateProfileData): Promise<{ user: UserProfile }> => {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (!token) throw new Error("Non authentifié");
    
    const bodyData: Record<string, unknown> = { ...data };
    if (data.firstName || data.lastName) {
      bodyData.name = `${data.firstName || ''} ${data.lastName || ''}`.trim();
      delete bodyData.firstName;
      delete bodyData.lastName;
    }
    
    const response = await fetchApi<{ success: boolean; data?: { user: UserProfile }; message?: string }>("/auth/profile", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(bodyData),
    });
    
    if (response.success && response.data) {
      const userData = response.data.user;
      return {
        user: {
          ...userData,
          id: userData.id || userData._id as string,
          firstName: userData.firstName || userData.name?.split(' ')[0] || '',
          lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
        }
      };
    }
    throw new Error(response.message || "Erreur de mise à jour du profil");
  },

  changePassword: async (data: ChangePasswordData): Promise<{ message: string }> => {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (!token) throw new Error("Non authentifié");
    
    // Modification pour matcher la nouvelle interface
    const requestData = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword
    };
    
    const response = await fetchApi<{ success: boolean; message: string }>("/auth/change-password", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(requestData),
    });
    
    if (response.success) return { message: response.message };
    throw new Error(response.message || "Erreur de changement de mot de passe");
  },

  healthCheck: async (): Promise<unknown> => {
    return fetchApi("/health", { method: "GET" });
  },

  getVersion: async (): Promise<unknown> => {
    return fetchApi("/version", { method: "GET" });
  }
};

export default authApi;
