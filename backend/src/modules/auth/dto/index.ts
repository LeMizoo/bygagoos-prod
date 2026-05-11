// backend/src/modules/auth/dto/index.ts

import { z } from 'zod';

// Schéma de validation pour l'inscription
export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  phone: z.string().optional(),
  role: z.enum(['CLIENT', 'STAFF', 'ADMIN', 'SUPER_ADMIN']).optional(),
});

// Schéma de validation pour la connexion
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export const googleLoginSchema = z.object({
  credential: z.string().min(1, 'Credential Google requis'),
});

// Schéma de validation pour le refresh token
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token requis'),
});

// Schéma de validation pour mot de passe oublié
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

// Schéma de validation pour réinitialisation de mot de passe
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requis'),
  newPassword: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

// Schéma de validation pour mise à jour du profil
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis').optional(),
  lastName: z.string().min(1, 'Le nom est requis').optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().url('URL d\'avatar invalide').optional(),
  address: z.string().optional(),
});

// Schéma de validation pour changement de mot de passe - CORRIGÉ: séparé en deux parties
export const changePasswordSchemaBase = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string().min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string().min(1, 'La confirmation du mot de passe est requise'),
});

export const changePasswordSchema = changePasswordSchemaBase.refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  }
);

// Types inférés des schémas
export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type GoogleLoginDto = z.infer<typeof googleLoginSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;

// Interfaces pour les réponses
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    name?: string;
    role: string;
    phone?: string;
    avatar?: string;
    dashboardPath?: string;
    department?: string | null;
    position?: string | null;
    familyAccess?: string[];
  };
  accessToken: string;
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface GoogleAuthConfigResponse {
  clientId: string;
  enabled: boolean;
  superAdminEmail: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  role: string;
  phone?: string;
  avatar?: string;
  address?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  dashboardPath?: string;
  department?: string | null;
  position?: string | null;
  familyAccess?: string[];
}
