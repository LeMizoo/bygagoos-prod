import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import authApi, { type UserProfile, type AuthResponse } from "../api/auth.api";

export type User = UserProfile;

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;  // ← Propriété (stockage)
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  setAuthData: (user: User, token: string, refreshToken: string) => void;
  checkAuth: () => Promise<void>;
  clearAuth: () => void;
  getAuthHeaders: () => Record<string, string>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (current: string, newPass: string, confirm: string) => Promise<void>;
  refreshTokenAction: () => Promise<string | null>;  // ← Renommé (action)
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log('🔑 Tentative de connexion:', email);
          
          const response: AuthResponse = await authApi.login({ email, password });

          console.log('✅ Connexion réussie:', response.user.email);
          
          set({
            user: response.user,
            token: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          localStorage.setItem("token", response.accessToken);
          localStorage.setItem("refreshToken", response.refreshToken);
          localStorage.setItem("user", JSON.stringify(response.user));
          
        } catch (error: any) {
          console.error('❌ Erreur login:', error);
          set({ 
            isLoading: false, 
            error: error.message || "Erreur de connexion" 
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await authApi.register(userData);

          console.log('✅ Inscription réussie:', response.user.email);
          
          set({
            user: response.user,
            token: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          localStorage.setItem("token", response.accessToken);
          localStorage.setItem("refreshToken", response.refreshToken);
          localStorage.setItem("user", JSON.stringify(response.user));
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || "Erreur d'inscription" 
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          get().clearAuth();
          window.location.href = "/home";
        }
      },

      setAuthData: (user: User, token: string, refreshToken: string) => {
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        });
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
      },

      checkAuth: async () => {
        const state = get();
        const token = state.token;
        const refreshToken = state.refreshToken;

        // Si pas de token mais refresh token présent, essayer de rafraîchir
        if (!token && refreshToken) {
          console.log('🔄 Token manquant mais refresh token présent, tentative de rafraîchissement...');
          try {
            const newToken = await get().refreshTokenAction(); // ← Renommé
            if (newToken) {
              console.log('✅ Token rafraîchi avec succès');
              return;
            }
          } catch (error) {
            console.error('❌ Échec du rafraîchissement automatique:', error);
          }
        }

        if (!token) {
          const localToken = localStorage.getItem("token");
          const localRefreshToken = localStorage.getItem("refreshToken");
          const localUser = localStorage.getItem("user");

          if (localToken && localRefreshToken && localUser) {
            try {
              const parsedUser = JSON.parse(localUser) as User;
              console.log('🔄 Restauration depuis localStorage:', parsedUser.email);
              set({
                token: localToken,
                refreshToken: localRefreshToken,
                user: parsedUser,
                isAuthenticated: true,
              });
            } catch {
              get().clearAuth();
            }
            return;
          }

          set({ isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        try {
          console.log('🔄 Vérification du token...');
          const { user } = await authApi.getMe(token);
          console.log('✅ Token valide, utilisateur:', user.email);
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          localStorage.setItem("user", JSON.stringify(user));
        } catch (error: any) {
          console.error('❌ Token invalide:', error);
          
          // Si token invalide mais refresh token présent, essayer de rafraîchir
          if (refreshToken) {
            console.log('🔄 Tentative de rafraîchissement du token expiré...');
            try {
              const newToken = await get().refreshTokenAction(); // ← Renommé
              if (newToken) {
                // Réessayer getMe avec le nouveau token
                const { user } = await authApi.getMe(newToken);
                set({
                  user,
                  isAuthenticated: true,
                  isLoading: false,
                });
                localStorage.setItem("user", JSON.stringify(user));
                return;
              }
            } catch (refreshError) {
              console.error('❌ Échec du rafraîchissement:', refreshError);
            }
          }
          
          get().clearAuth();
        } finally {
          set({ isLoading: false });
        }
      },

      // Renommé de refreshToken à refreshTokenAction
      refreshTokenAction: async (): Promise<string | null> => {
        const refreshToken = get().refreshToken || localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          console.log('ℹ️ Pas de refresh token disponible');
          return null;
        }

        try {
          console.log('🔄 Rafraîchissement du token...');
          const response = await authApi.refreshToken(refreshToken);
          
          set({
            token: response.accessToken,
            refreshToken: response.refreshToken || refreshToken,
          });
          
          localStorage.setItem("token", response.accessToken);
          if (response.refreshToken) {
            localStorage.setItem("refreshToken", response.refreshToken);
          }
          
          console.log('✅ Token rafraîchi avec succès');
          return response.accessToken;
        } catch (error) {
          console.error('❌ Erreur refreshTokenAction:', error);
          get().clearAuth();
          return null;
        }
      },

      clearAuth: () => {
        console.log('🚪 Effacement de l\'authentification');
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      },

      getAuthHeaders: () => {
        const token = get().token;
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        return headers;
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = await authApi.updateProfile(data);
          set({ user, isLoading: false });
          localStorage.setItem("user", JSON.stringify(user));
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || "Erreur de mise à jour" 
          });
          throw error;
        }
      },

      changePassword: async (current: string, newPass: string, confirm: string) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.changePassword(current, newPass, confirm);
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || "Erreur de changement de mot de passe" 
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);