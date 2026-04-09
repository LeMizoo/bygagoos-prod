// frontend/src/stores/authStore.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import authApi, { type UserProfile, type AuthResponse, type UpdateProfileData } from "../api/auth.api";

export type User = UserProfile;

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
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
  refreshTokenAction: () => Promise<string | null>;
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

      /**
       * Connecter un utilisateur
       */
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await authApi.login({ email, password });
          
          set({
            user: response.user,
            token: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || "Erreur de connexion" 
          });
          throw error;
        }
      },

      /**
       * Inscrire un nouvel utilisateur
       */
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await authApi.register(userData);
          set({
            user: response.user,
            token: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || "Erreur d'inscription" 
          });
          throw error;
        }
      },

      /**
       * Déconnexion robuste (Nettoyage garanti)
       */
      logout: async () => {
        set({ isLoading: true });
        try {
          // On tente d'avertir le backend (route maintenant publique)
          await authApi.logout();
        } catch (error) {
          // Prefer development-only logger
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { dev } = require('../utils/devLogger');
          dev.warn("Déconnexion API notifiée avec erreur (ignorée):", error);
        } finally {
          // QUOI QU'IL ARRIVE : On vide tout
          get().clearAuth();
          // Redirection forcée pour nettoyer l'état de l'application
          window.location.href = "/home";
        }
      },

      /**
       * Définir manuellement les données d'authentification
       */
      setAuthData: (user: User, token: string, refreshToken: string) => {
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        });
      },

      /**
       * Vérifier l'état de l'authentification au chargement
       */
      checkAuth: async () => {
        const { token, refreshToken } = get();

        // 1. Si aucun token mais refresh présent -> tentative de récupération
        if (!token && refreshToken) {
          try {
            await get().refreshTokenAction();
          } catch {
            return get().clearAuth();
          }
        }

        // 2. Si toujours pas de token après tentative -> clear
        const currentToken = get().token;
        if (!currentToken) {
          return get().clearAuth();
        }

        set({ isLoading: true });
        try {
          const { user } = await authApi.getMe(currentToken);
          set({ user, isAuthenticated: true });
        } catch (error: any) {
          // Si le token est expiré ici, on tente une dernière fois le refresh
          if (refreshToken) {
            try {
              const newToken = await get().refreshTokenAction();
              if (newToken) {
                const { user } = await authApi.getMe(newToken);
                set({ user, isAuthenticated: true });
                return;
              }
            } catch (e) {
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              const { dev } = require('../utils/devLogger');
              dev.error("Échec rafraîchissement profond:", e);
            }
          }
          get().clearAuth();
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Rafraîchir le token d'accès
       */
      refreshTokenAction: async (): Promise<string | null> => {
        const { refreshToken } = get();
        
        if (!refreshToken) return null;

        try {
          const response = await authApi.refreshToken(refreshToken);
          
          set({
            token: response.accessToken,
            refreshToken: response.refreshToken || refreshToken,
            isAuthenticated: true
          });
          
          return response.accessToken;
        } catch (error) {
          get().clearAuth();
          return null;
        }
      },

      /**
       * Effacer proprement toutes les traces d'auth
       */
      clearAuth: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        // Le middleware 'persist' s'occupe du localStorage automatiquement
      },

      /**
       * Helper pour les headers
       */
      getAuthHeaders: () => {
        const { token } = get();
        return {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        };
      },

      /**
       * Mise à jour profil
       */
      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          const updateData: UpdateProfileData = {
            ...data,
            name: data.name || (data.firstName && data.lastName ? `${data.firstName} ${data.lastName}`.trim() : undefined)
          };
          
          const response = await authApi.updateProfile(updateData);
          
          // Mise à jour de l'utilisateur avec la réponse ou fusion locale
          set((state) => ({ 
            user: response.user ? (response.user as User) : { ...state.user, ...data } as User,
            isLoading: false 
          }));
          
        } catch (error: any) {
          if (error.status === 401) {
            const newToken = await get().refreshTokenAction();
            if (newToken) return get().updateProfile(data);
          }
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      /**
       * Changement de mot de passe
       */
      changePassword: async (current: string, newPass: string, confirm: string) => {
        set({ isLoading: true, error: null });
        try {
          // 🔥 CORRECTION : Passage en mode objet pour matcher la signature de l'API
          await authApi.changePassword({
            currentPassword: current,
            newPassword: newPass,
            confirmPassword: confirm
          });
          set({ isLoading: false });
        } catch (error: any) {
          if (error.status === 401) {
            const newToken = await get().refreshTokenAction();
            // L'appel interne à la méthode du store reste avec les 3 arguments
            if (newToken) return get().changePassword(current, newPass, confirm);
          }
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // On ne persiste que les données essentielles
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Hooks utilitaires
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);