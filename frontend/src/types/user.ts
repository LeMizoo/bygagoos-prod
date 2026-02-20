// frontend/src/types/user.ts
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  avatar?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  department?: string;
  position?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  message?: string;
}

export interface VerifyResponse {
  success: boolean;
  data: User;
  message?: string;
}
