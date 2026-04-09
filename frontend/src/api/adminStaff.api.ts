// frontend/src/api/adminStaff.api.ts
import { API_URL, getAuthHeaders } from "./index";
import { UserRole } from "../types/roles";
import dev from "../utils/devLogger";

// ==================== TYPES ====================

export interface StaffMember {
  _id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  category: string;
  role: UserRole | string;
  responsibilities: string[];
  active: boolean;
  isActive: boolean;
  joinedAt: string;
  department: string;
  skills: string[];
  avatar?: string;
  user?: { _id: string; email: string; role: string };
  createdAt?: string;
  updatedAt?: string;
  name?: string;
  phone?: string;
  position?: string;
  description?: string;
  notes?: string;
  status?: "active" | "inactive";
  
  // Nouveaux champs
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  birthday?: string;
  hireDate?: string;
  contractType?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  lastLoginAt?: string;
  createdBy?: string;
  updatedBy?: string;
  permissions?: string[];
}

// Types pour les filtres
export interface StaffFilters {
  role?: UserRole | string;
  department?: string;
  isActive?: boolean;
  searchTerm?: string;
  city?: string;
  contractType?: string;
  hireDateFrom?: string;
  hireDateTo?: string;
  skills?: string[];
  page?: number;
  limit?: number;
  sortBy?: keyof StaffMember;
  sortOrder?: 'asc' | 'desc';
}

// Types pour la pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Types pour les statistiques
export interface StaffStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
  byDepartment: Record<string, number>;
  byCity: Record<string, number>;
  byContractType: Record<string, number>;
  recentHires: StaffMember[];
  upcomingBirthdays: StaffMember[];
}

// Types pour l'export
export type ExportFormat = 'csv' | 'excel' | 'pdf';
export interface ExportOptions {
  format: ExportFormat;
  fields?: (keyof StaffMember)[];
  filters?: StaffFilters;
  ids?: string[];
  fileName?: string;
}

// Types pour les actions groupées
export interface BulkActionResponse {
  success: number;
  failed: number;
  errors?: Array<{ id: string; error: string }>;
}

// ==================== CLASSE D'ERREUR ====================

export class StaffApiError extends Error {
  status: number;
  code?: string;
  originalError?: any;
  validationErrors?: Record<string, string[]>;

  constructor(error: any) {
    let message = "Erreur inconnue";
    let status = 500;
    let validationErrors;
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error?.message) {
      message = error.message;
    }
    
    if (error?.status) {
      status = error.status;
    } else if (error?.response?.status) {
      status = error.response.status;
    }
    
    if (error?.validationErrors) {
      validationErrors = error.validationErrors;
    }
    
    super(message);
    this.name = 'StaffApiError';
    this.status = status;
    this.code = error?.code;
    this.originalError = error;
    this.validationErrors = validationErrors;
  }

  isNotFound(): boolean {
    return this.status === 404;
  }

  isUnauthorized(): boolean {
    return this.status === 401;
  }

  isForbidden(): boolean {
    return this.status === 403;
  }

  isValidationError(): boolean {
    return this.status === 400 && !!this.validationErrors;
  }

  isNetworkError(): boolean {
    return this.status === 0;
  }
}

// ==================== CONFIGURATION ====================

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

class ApiCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      key,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(keyPattern: string): void {
    const regex = new RegExp(keyPattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

const cache = new ApiCache();

// ==================== CONSTANTES CLOUDINARY ====================

const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  folder: import.meta.env.VITE_CLOUDINARY_FOLDER || 'bygagoos/staff-avatars',
};

const isCloudinaryConfigured = (): boolean => {
  return Boolean(CLOUDINARY_CONFIG.cloudName && CLOUDINARY_CONFIG.uploadPreset);
};

// ==================== FETCH WRAPPER ====================

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
  status?: number;
  validationErrors?: Record<string, string[]>;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

const fetchApi = async <T>(
  url: string,
  options: RequestInit = {},
  useCache: boolean = false,
  cacheKey?: string,
  retryCount = 0,
): Promise<ApiResponse<T>> => {
  // Vérifier le cache
    if (useCache && cacheKey) {
    const cached = cache.get<T>(cacheKey);
    if (cached) {
      dev.log(`📦 Cache hit: ${cacheKey}`);
      return { success: true, data: cached };
    }
  }

  try {
    const headers = {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
      ...options.headers,
    } as Record<string, string>;

    // 🔥 CORRECTION: Supprimer /admin/ si présent
    let transformedUrl = url;
    if (transformedUrl.includes('/admin/')) {
      transformedUrl = transformedUrl.replace('/admin/', '/');
    }
    
    // 🔥 IMPORTANT: API_URL contient déjà /api, donc on ne l'ajoute PAS ici
    const fullUrl = `${API_URL}${transformedUrl.startsWith('/') ? transformedUrl : `/${transformedUrl}`}`;
    
    dev.log(`🌐 Staff API: ${options.method || 'GET'} ${fullUrl}`);

    const response = await fetch(fullUrl, { ...options, headers });

    // Parse body once
    let parsedBody: any = null;
    try {
      parsedBody = await response.json();
    } catch {
      // Ignorer si pas de JSON
    }

    // Gestion du token expiré (401)
    if (response.status === 401 && retryCount === 0) {
      dev.log('🔄 Token expiré, tentative de rafraîchissement...');
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Import dynamique pour éviter les dépendances circulaires
          const { authApi } = await import('./auth.api');
          const newTokens = await authApi.refreshToken(refreshToken);
          
          // Mettre à jour les tokens
          localStorage.setItem('token', newTokens.accessToken);
          localStorage.setItem('accessToken', newTokens.accessToken);
          if (newTokens.refreshToken) {
            localStorage.setItem('refreshToken', newTokens.refreshToken);
          }
          
          dev.log('✅ Token rafraîchi, nouvelle tentative...');
          
          // Réessayer avec le nouveau token
          return fetchApi<T>(url, options, useCache, cacheKey, retryCount + 1);
        }
      } catch (refreshError) {
          dev.error('❌ Échec du rafraîchissement du token:', refreshError);
        // Rediriger vers login
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
        throw new Error('Session expirée, veuillez vous reconnecter');
      }
    }

    if (!response.ok) {
      const errorMessage = parsedBody?.message || `HTTP Error ${response.status}: ${response.statusText}`;
      const validationErrors = parsedBody?.validationErrors;
      return {
        success: false,
        message: errorMessage,
        status: response.status,
        data: parsedBody,
        validationErrors,
      };
    }

    const data = parsedBody;
    const result = {
      success: true,
      ...data,
      status: response.status,
      meta: data?.meta || {
        page: data?.page,
        limit: data?.limit,
        total: data?.total,
        totalPages: data?.totalPages,
      },
    };

    // Mettre en cache
    if (useCache && cacheKey && result.data) {
      cache.set(cacheKey, result.data);
    }

    return result;
    } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Erreur réseau (CORS / serveur inaccessible)",
      status: 0,
    };
  }
};

// ==================== FONCTIONS CLOUDINARY ====================

/**
 * Upload d'image vers Cloudinary
 */
const uploadToCloudinary = async (file: File, options?: {
  folder?: string;
  transformations?: string;
}): Promise<{ url: string; publicId: string }> => {
  if (!isCloudinaryConfigured()) {
    throw new StaffApiError({
      message: 'Cloudinary non configuré. Vérifiez vos variables d\'environnement.',
      status: 500,
    });
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', options?.folder || CLOUDINARY_CONFIG.folder);
    
    if (options?.transformations) {
      formData.append('transformation', options.transformations);
    }

    dev.log('📤 Uploading to Cloudinary...', {
      cloudName: CLOUDINARY_CONFIG.cloudName,
      folder: options?.folder || CLOUDINARY_CONFIG.folder,
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
    });

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Upload failed');
    }

    const data = await response.json();
    
    dev.log('✅ Cloudinary upload successful:', {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      size: `${(data.bytes / 1024).toFixed(2)} KB`,
    });

    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    dev.error('❌ Cloudinary upload error:', error);
    throw new StaffApiError({
      message: error instanceof Error ? error.message : 'Erreur upload Cloudinary',
      status: 500,
    });
  }
};

/**
 * Upload d'avatar vers Cloudinary avec redimensionnement automatique
 */
const uploadAvatarToCloudinary = async (
  file: File,
  options?: {
    folder?: string;
    width?: number;
    height?: number;
  }
): Promise<{ url: string; publicId: string }> => {
  // Vérifier le type de fichier
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    throw new StaffApiError({
      message: 'Format non supporté. Utilisez JPG, PNG, GIF, WEBP ou SVG',
      status: 400,
    });
  }

  // Vérifier la taille (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new StaffApiError({
      message: `Image trop volumineuse (max ${maxSize / (1024 * 1024)}MB)`,
      status: 400,
    });
  }

  const transformations = [
    `w_${options?.width || 400}`,
    `h_${options?.height || 400}`,
    'c_fill',
    'g_face',
    'q_auto',
    'f_auto',
  ].join(',');

  return uploadToCloudinary(file, {
    folder: options?.folder || 'bygagoos/staff-avatars',
    transformations,
  });
};

/**
 * Récupère une URL d'avatar optimisée avec transformations
 */
const getOptimizedAvatarUrl = (
  url: string,
  options?: {
    width?: number;
    height?: number;
    radius?: number;
    quality?: number;
  }
): string => {
  if (!url) return '';
  
  if (!url.includes('cloudinary.com')) {
    return url;
  }

  try {
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;

    const transformations = [
      options?.width && `w_${options.width}`,
      options?.height && `h_${options.height}`,
      options?.radius && `r_${options.radius}`,
      options?.quality && `q_${options.quality}`,
      'c_fill',
      'f_auto',
    ].filter(Boolean).join(',');

    return transformations 
      ? `${parts[0]}/upload/${transformations}/${parts[1]}`
      : url;
  } catch (error) {
    dev.warn('Error optimizing avatar URL:', error);
    return url;
  }
};

/**
 * Supprime un avatar de Cloudinary
 */
const deleteAvatarFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    const response = await fetchApi('/staff/avatar/delete', {
      method: 'POST',
      body: JSON.stringify({ publicId }),
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete avatar');
    }
  } catch (error) {
    dev.error('❌ Error deleting avatar:', error);
    throw new StaffApiError(error);
  }
};

// ==================== TRANSFORMATIONS ====================

const getDepartmentFromRole = (role?: string): string => {
  if (!role) return "Général";
  const roleMap: Record<string, string> = {
    FOUNDER: "Direction",
    INSPIRATION: "Création",
    PRODUCTION: "Production",
    CREATION: "Design",
    ADMIN_INSPIRATION: "Direction Créative",
    ADMIN_PRODUCTION: "Direction Production",
    ADMIN_COMMUNICATION: "Communication",
    SUPER_ADMIN: "Direction Générale",
    ARTISAN: "Atelier",
    USER: "Support",
    STAFF: "Personnel",
    ADMIN: "Administration",
    MANAGER: "Management",
    DESIGNER: "Studio",
  };
  return roleMap[role] || "Général";
};

const getPositionFromRole = (role?: string): string => {
  if (!role) return "Membre";
  const positionMap: Record<string, string> = {
    FOUNDER: "Fondateur",
    INSPIRATION: "Directeur Créatif",
    PRODUCTION: "Chef d'Atelier",
    CREATION: "Designer",
    ADMIN_INSPIRATION: "Responsable Création",
    ADMIN_PRODUCTION: "Responsable Production",
    ADMIN_COMMUNICATION: "Responsable Communication",
    SUPER_ADMIN: "Super Administrateur",
    ARTISAN: "Artisan",
    USER: "Utilisateur",
    STAFF: "Personnel",
    ADMIN: "Administrateur",
    MANAGER: "Manager",
    DESIGNER: "Designer",
  };
  return positionMap[role] || "Membre";
};

export const transformStaffData = (data: any): StaffMember => {
  const firstName = data.firstName || data.name?.split(" ")[0] || "";
  const lastName = data.lastName || data.name?.split(" ").slice(1).join(" ") || "";
  const fullName = `${firstName} ${lastName}`.trim() || data.displayName || data.name || "Sans nom";

  return {
    _id: data._id || data.id || "unknown-id",
    firstName,
    lastName,
    name: fullName,
    displayName: data.displayName || fullName,
    email: data.email || "",
    category: data.category || "STAFF",
    role: data.role || "STAFF",
    responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : [],
    active: data.active !== false,
    isActive: data.isActive !== false,
    joinedAt: data.joinedAt || data.createdAt || data.hireDate || new Date().toISOString(),
    department: data.department || getDepartmentFromRole(data.role),
    skills: Array.isArray(data.skills) ? data.skills : [],
    avatar: data.profileImage || data.avatar || data.photo || undefined,
    user: data.user || undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    phone: data.phone || data.mobile || "",
    position: data.position || getPositionFromRole(data.role),
    description: data.description || data.bio || "",
    notes: data.notes || "",
    status: data.status || (data.isActive ? "active" : "inactive"),
    
    address: data.address || "",
    city: data.city || "",
    country: data.country || "France",
    postalCode: data.postalCode || "",
    birthday: data.birthday || data.dateOfBirth || null,
    hireDate: data.hireDate || data.joinedAt || data.createdAt || null,
    contractType: data.contractType || "CDI",
    emergencyContact: data.emergencyContact || {
      name: "",
      phone: "",
      relationship: "",
    },
    socialLinks: data.socialLinks || {
      linkedin: data.linkedin || "",
      twitter: data.twitter || "",
      facebook: data.facebook || "",
      instagram: data.instagram || "",
    },
    lastLoginAt: data.lastLoginAt || null,
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
    permissions: data.permissions || [],
  };
};

// ==================== API METHODS ====================

/**
 * Récupère tous les membres du staff avec filtres optionnels
 */
const getAllStaff = async (
  filters?: StaffFilters
): Promise<StaffMember[]> => {
  try {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.role) params.append('role', filters.role);
      if (filters.department) params.append('department', filters.department);
      if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
      if (filters.searchTerm) params.append('search', filters.searchTerm);
      if (filters.city) params.append('city', filters.city);
      if (filters.contractType) params.append('contractType', filters.contractType);
      if (filters.hireDateFrom) params.append('hireDateFrom', filters.hireDateFrom);
      if (filters.hireDateTo) params.append('hireDateTo', filters.hireDateTo);
      if (filters.skills?.length) params.append('skills', filters.skills.join(','));
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    }

    const queryString = params.toString();
    const url = `/staff${queryString ? `?${queryString}` : ''}`;
    const cacheKey = `staff:all:${queryString}`;

    const response = await fetchApi<StaffMember[]>(url, {}, true, cacheKey);
    
    if (!response.success || !response.data) {
      dev.warn("⚠️ No data received from API");
      return [];
    }
    
    const staffData = Array.isArray(response.data) ? response.data : [response.data];
    return staffData.map(transformStaffData);
  } catch (error) {
    dev.error("❌ Error in getAllStaff:", error);
    throw new StaffApiError(error);
  }
};

/**
 * Récupère un membre du staff par son ID
 */
const getStaffById = async (id: string): Promise<StaffMember> => {
  try {
    const cacheKey = `staff:${id}`;
    const response = await fetchApi<StaffMember>(`/staff/${id}`, {}, true, cacheKey);
    
    if (response.success && response.data) {
      return transformStaffData(response.data);
    }
    
    throw new StaffApiError({ 
      message: response.message || "Staff not found", 
      status: response.status || 404 
    });
  } catch (error) {
    dev.error("❌ Error in getStaffById:", error);
    throw new StaffApiError(error);
  }
};

/**
 * Crée un nouveau membre du staff
 */
const createStaff = async (
  data: Partial<StaffMember>,
): Promise<StaffMember> => {
  try {
    const response = await fetchApi<StaffMember>("/staff", {
      method: "POST",
      body: JSON.stringify(data),
    });
    
    if (response.success && response.data) {
      cache.invalidate('staff:all');
      return transformStaffData(response.data);
    }
    
    throw new StaffApiError({ 
      message: response.message || "Failed to create staff", 
      status: response.status || 500,
      validationErrors: response.validationErrors,
    });
  } catch (error) {
    dev.error("❌ Error in createStaff:", error);
    throw new StaffApiError(error);
  }
};

/**
 * Met à jour un membre du staff
 */
const updateStaff = async (
  id: string,
  data: Partial<StaffMember>,
): Promise<StaffMember> => {
  try {
    const response = await fetchApi<StaffMember>(`/staff/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    
    if (response.success && response.data) {
      cache.invalidate('staff:all');
      cache.invalidate(`staff:${id}`);
      return transformStaffData(response.data);
    }
    
    throw new StaffApiError({ 
      message: response.message || "Failed to update staff", 
      status: response.status || 500,
      validationErrors: response.validationErrors,
    });
  } catch (error) {
    dev.error("❌ Error in updateStaff:", error);
    throw new StaffApiError(error);
  }
};

/**
 * Supprime un membre du staff
 */
const deleteStaff = async (id: string): Promise<void> => {
  try {
    const response = await fetchApi(`/staff/${id}`, { 
      method: "DELETE" 
    });
    
    if (!response.success) {
      throw new StaffApiError({ 
        message: response.message || "Failed to delete staff", 
        status: response.status || 500 
      });
    }
    
    cache.invalidate('staff:all');
    cache.invalidate(`staff:${id}`);
  } catch (error) {
    dev.error("❌ Error in deleteStaff:", error);
    throw new StaffApiError(error);
  }
};

/**
 * Active/désactive un membre du staff
 */
const toggleStaffStatus = async (
  id: string,
  isActive: boolean,
): Promise<StaffMember> => {
  return updateStaff(id, { isActive: !isActive });
};

/**
 * Récupère les statistiques du staff
 */
const getStaffStats = async (): Promise<StaffStats> => {
  try {
    const cacheKey = 'staff:stats';
    const response = await fetchApi<StaffStats>('/staff/stats', {}, true, cacheKey);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    const staff = await getAllStaff();
    
    const stats: StaffStats = {
      total: staff.length,
      active: staff.filter(s => s.isActive).length,
      inactive: staff.filter(s => !s.isActive).length,
      byRole: {},
      byDepartment: {},
      byCity: {},
      byContractType: {},
      recentHires: [],
      upcomingBirthdays: [],
    };

    staff.forEach(member => {
      stats.byRole[member.role] = (stats.byRole[member.role] || 0) + 1;
      const dept = member.department || 'Non défini';
      stats.byDepartment[dept] = (stats.byDepartment[dept] || 0) + 1;
      if (member.city) {
        stats.byCity[member.city] = (stats.byCity[member.city] || 0) + 1;
      }
      if (member.contractType) {
        stats.byContractType[member.contractType] = (stats.byContractType[member.contractType] || 0) + 1;
      }
    });

    stats.recentHires = [...staff]
      .filter(m => m.hireDate)
      .sort((a, b) => new Date(b.hireDate!).getTime() - new Date(a.hireDate!).getTime())
      .slice(0, 5);

    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);

    stats.upcomingBirthdays = staff
      .filter(m => m.birthday)
      .filter(m => {
        const birthday = new Date(m.birthday!);
        birthday.setFullYear(today.getFullYear());
        return birthday >= today && birthday <= nextMonth;
      })
      .sort((a, b) => {
        const dateA = new Date(a.birthday!);
        const dateB = new Date(b.birthday!);
        dateA.setFullYear(today.getFullYear());
        dateB.setFullYear(today.getFullYear());
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);

    return stats;
  } catch (error) {
    dev.error("❌ Error in getStaffStats:", error);
    throw new StaffApiError(error);
  }
};

/**
 * Exporte les données du staff
 */
const exportStaff = async (
  options: ExportOptions
): Promise<Blob> => {
  try {
    const response = await fetch(`${API_URL}/staff/export`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    dev.error("❌ Error in exportStaff:", error);
    throw new StaffApiError(error);
  }
};

/**
 * Actions groupées sur plusieurs membres
 */
const bulkUpdateStaff = async (
  ids: string[],
  data: Partial<StaffMember>
): Promise<BulkActionResponse> => {
  try {
    const response = await fetchApi<BulkActionResponse>('/staff/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ ids, data }),
    });

    if (response.success && response.data) {
      cache.invalidate('staff:all');
      ids.forEach(id => cache.invalidate(`staff:${id}`));
      return response.data;
    }

    throw new StaffApiError({
      message: response.message || "Bulk update failed",
      status: response.status || 500,
    });
  } catch (error) {
    dev.error("❌ Error in bulkUpdateStaff:", error);
    throw new StaffApiError(error);
  }
};

/**
 * Suppression groupée
 */
const bulkDeleteStaff = async (
  ids: string[]
): Promise<BulkActionResponse> => {
  try {
    const response = await fetchApi<BulkActionResponse>('/staff/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });

    if (response.success && response.data) {
      cache.invalidate('staff:all');
      ids.forEach(id => cache.invalidate(`staff:${id}`));
      return response.data;
    }

    throw new StaffApiError({
      message: response.message || "Bulk delete failed",
      status: response.status || 500,
    });
  } catch (error) {
    dev.error("❌ Error in bulkDeleteStaff:", error);
    throw new StaffApiError(error);
  }
};

/**
 * Upload d'avatar avec fallback Cloudinary
 */
const uploadAvatar = async (
  id: string,
  file: File
): Promise<{ avatarUrl: string }> => {
  try {
    if (isCloudinaryConfigured()) {
      try {
        dev.log('🖼️ Uploading avatar to Cloudinary...');
        
        const cloudinaryResult = await uploadAvatarToCloudinary(file, {
          folder: `bygagoos/staff-${id}`,
        });

        dev.log('✅ Avatar uploaded to Cloudinary:', cloudinaryResult.url);

        try {
          await updateStaff(id, { avatar: cloudinaryResult.url });
          dev.log('✅ Staff updated with new avatar URL');
        } catch (backendError) {
          dev.warn('⚠️ Staff updated but backend sync failed:', backendError);
        }

        cache.invalidate(`staff:${id}`);
        cache.invalidate('staff:all');

        return { avatarUrl: cloudinaryResult.url };
      } catch (cloudinaryError) {
        dev.warn('⚠️ Cloudinary upload failed, trying backend...', cloudinaryError);
      }
    }

    dev.log('🔄 Trying backend upload...');
    
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_URL}/staff/${id}/avatar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    cache.invalidate(`staff:${id}`);
    
    return data;
  } catch (error) {
    dev.error("❌ Error in uploadAvatar:", error);
    throw new StaffApiError(error);
  }
};

/**
 * Récupère les options pour les filtres
 */
const getFilterOptions = async (): Promise<{
  roles: string[];
  departments: string[];
  cities: string[];
  contractTypes: string[];
}> => {
  try {
    const staff = await getAllStaff();
    
    return {
      roles: [...new Set(staff.map(s => s.role).filter(Boolean))] as string[],
      departments: [...new Set(staff.map(s => s.department).filter(Boolean))] as string[],
      cities: [...new Set(staff.map(s => s.city).filter(Boolean))] as string[],
      contractTypes: [...new Set(staff.map(s => s.contractType).filter(Boolean))] as string[],
    };
  } catch (error) {
    dev.error("❌ Error in getFilterOptions:", error);
    throw new StaffApiError(error);
  }
};

/**
 * Recherche avancée
 */
const searchStaff = async (
  query: string,
  fields?: (keyof StaffMember)[]
): Promise<StaffMember[]> => {
  try {
    const staff = await getAllStaff();
    const searchTerm = query.toLowerCase();

    return staff.filter(member => {
      const searchableFields = fields || [
        'firstName', 'lastName', 'email', 'phone', 
        'department', 'position', 'city', 'skills'
      ];

      return searchableFields.some(field => {
        const value = member[field];
        if (!value) return false;
        
        if (Array.isArray(value)) {
          return value.some(v => String(v).toLowerCase().includes(searchTerm));
        }
        
        return String(value).toLowerCase().includes(searchTerm);
      });
    });
  } catch (error) {
    dev.error("❌ Error in searchStaff:", error);
    throw new StaffApiError(error);
  }
};

// ==================== API OBJECT ====================

export const adminStaffApi = {
  getAll: getAllStaff,
  getById: getStaffById,
  create: createStaff,
  update: updateStaff,
  delete: deleteStaff,
  toggleStatus: toggleStaffStatus,
  getStats: getStaffStats,
  search: searchStaff,
  getFilterOptions,
  bulkUpdate: bulkUpdateStaff,
  bulkDelete: bulkDeleteStaff,
  export: exportStaff,
  uploadAvatar,
  uploadToCloudinary,
  uploadAvatarToCloudinary,
  getOptimizedAvatarUrl,
  deleteAvatarFromCloudinary,
};

export { getAllStaff };

export default adminStaffApi;