// frontend/src/types/index.ts

// Interfaces de base (maintenues pour compatibilité)
export interface apiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
  isInitialized?: boolean;
}

export interface FilterOptions {
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}

// Types communs
export type Status = "active" | "inactive" | "pending" | "draft" | "archived";
export type SortOrder = "asc" | "desc";

// Interface pour les statistiques
export interface DashboardStats {
  totalClients: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  activeDesigns: number;
  monthlyGrowth: number;
}

// Interface pour les notifications
export interface Notification {
  _id: string;
  type: "order" | "client" | "system" | "alert";
  title: string;
  message: string;
  read: boolean;
  data?: any;
  createdAt: string;
}

// Interface pour les fichiers
export interface UploadedFile {
  _id: string;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
  createdAt: string;
}

// Interface pour les logs d'activité
export interface ActivityLog {
  _id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: "order" | "client" | "design" | "staff" | "settings";
  entityId: string;
  entityName: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// Interface pour les sélecteurs
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Interface pour les formulaires
export interface FormError {
  field: string;
  message: string;
}

// Interface pour les tableaux paginés
export interface TablePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Interface pour les graphiques
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

// Interface pour les widgets
export interface WidgetData {
  title: string;
  value: number | string;
  change?: number;
  icon?: string;
  color?: string;
}

// Types utilitaires
export type Maybe<T> = T | null | undefined;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

// Alias pour les types communs
export type ID = string;
export type Email = string;
export type Phone = string;
export type Currency = "EUR" | "USD" | "MGA" | "MUR";
export type DateISO = string;

// Helper types pour les formulaires
export type FormMode = "create" | "edit" | "view";

// Interface pour les résultats de recherche
export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
}

// Interface pour les préférences utilisateur
export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: "fr" | "en" | "mg";
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    defaultView: "overview" | "orders" | "clients" | "designs";
    widgets: string[];
  };
}

// Types de base (explicites au lieu d'imports)
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
}

export interface Staff {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  skills: string[];
  isActive: boolean;
  avatar?: string;
  user?: {
    _id: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  totalOrders?: number;
  totalSpent?: number;
  status?: "active" | "inactive" | "pending";
}

export interface Design {
  _id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  images: string[];
  priceRange: {
    min: number;
    max: number;
  };
  isFeatured: boolean;
  isActive?: boolean;
  price?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  description: string;
  deadline: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  price?: number;
  notes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

// Types exportés séparément
export * from "./staff";
export * from "./client";
export * from "./design";
export * from "./order";
export * from "./settings";
export * from "./taxi";
