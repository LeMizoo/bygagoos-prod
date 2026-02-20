// frontend/src/api/adminStaff.api.ts
import { API_URL, getAuthHeaders } from "./index";
import { Staff } from "../types/staff";

export interface StaffMember {
  _id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  category: string;
  role: string;
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
}

interface apiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

// Fetch wrapper avec URL absolue
const fetchApi = async <T>(
  url: string,
  options: RequestInit = {},
): Promise<apiResponse<T>> => {
  try {
    const headers = {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
      ...options.headers,
    } as Record<string, string>;

    // Transformation des URLs /admin/xxx → /xxx
    let transformedUrl = url;
    if (transformedUrl.includes('/admin/')) {
      transformedUrl = transformedUrl.replace('/admin/', '/');
    }

    const fullUrl = `${API_URL}${transformedUrl}`;
    console.log(`🌐 Staff API: ${fullUrl}`);

    const response = await fetch(fullUrl, { ...options, headers });

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // ignore
      }
      return { success: false, message: errorMessage };
    }

    const data = await response.json();
    return { success: true, ...data };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Erreur réseau (CORS / serveur inaccessible)",
    };
  }
};

// Transformation des données (inchangée)
const transformStaffData = (data: any): StaffMember => {
  return {
    _id: data._id || data.id || "unknown-id",
    firstName: data.firstName || data.name?.split(" ")[0] || "",
    lastName: data.lastName || data.name?.split(" ").slice(1).join(" ") || "",
    name: data.name || `${data.firstName || ""} ${data.lastName || ""}`.trim(),
    displayName: data.displayName || data.name || "Sans nom",
    email: data.email || "",
    category: data.category || "PRODUCTION",
    role: data.role || "CREATION",
    responsibilities: Array.isArray(data.responsibilities)
      ? data.responsibilities
      : [],
    active: data.active !== false,
    isActive: data.isActive !== false,
    joinedAt: data.joinedAt || data.createdAt || new Date().toISOString(),
    department: data.department || getDepartmentFromRole(data.role),
    skills: Array.isArray(data.skills)
      ? data.skills
      : Array.isArray(data.responsibilities)
        ? data.responsibilities.slice(0, 5)
        : [],
    avatar: data.profileImage || data.avatar || undefined,
    user: data.user || undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    phone: data.phone || "",
    position: data.position || data.role || "",
    description: data.description || data.bio || "",
    notes: data.notes || "",
    status: data.status || (data.isActive ? "active" : "inactive"),
  };
};

const getDepartmentFromRole = (role?: string): string => {
  if (!role) return "LOGISTIQUE";
  const roleMap: Record<string, string> = {
    FOUNDER: "ADMINISTRATION",
    INSPIRATION: "INSPIRATION",
    PRODUCTION: "PRODUCTION",
    CREATION: "CREATION",
    ADMIN_INSPIRATION: "INSPIRATION",
    ADMIN_PRODUCTION: "PRODUCTION",
    ADMIN_COMMUNICATION: "COMMUNICATION",
    SUPER_ADMIN: "ADMINISTRATION",
    ARTISAN: "PRODUCTION",
    USER: "LOGISTIQUE",
    STAFF: "LOGISTIQUE",
    ADMIN: "ADMINISTRATION",
    MANAGER: "MANAGEMENT",
  };
  return roleMap[role] || "LOGISTIQUE";
};

// ------------------------------------------------------------
// Routes API – SANS le préfixe /api (car API_URL le contient)
// ------------------------------------------------------------

export const getAllStaff = async (): Promise<StaffMember[]> => {
  try {
    const response = await fetchApi<StaffMember[]>("/admin/staff");
    if (!response.success || !response.data) {
      console.warn("⚠️ No data received from API");
      return [];
    }
    const staffData = Array.isArray(response.data)
      ? response.data
      : [response.data];
    return staffData.map(transformStaffData);
  } catch (error) {
    console.error("❌ Error in getAllStaff:", error);
    return [];
  }
};

export const getStaffById = async (id: string): Promise<StaffMember> => {
  const response = await fetchApi<StaffMember>(`/admin/staff/${id}`);
  if (response.success && response.data) {
    return transformStaffData(response.data);
  }
  throw new Error(response.message || "Staff not found");
};

export const createStaff = async (
  data: Partial<Staff>,
): Promise<StaffMember> => {
  const response = await fetchApi<StaffMember>("/admin/staff", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (response.success && response.data) {
    return transformStaffData(response.data);
  }
  throw new Error(response.message || "Failed to create staff");
};

export const updateStaff = async (
  id: string,
  data: Partial<Staff>,
): Promise<StaffMember> => {
  const response = await fetchApi<StaffMember>(`/admin/staff/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (response.success && response.data) {
    return transformStaffData(response.data);
  }
  throw new Error(response.message || "Failed to update staff");
};

export const deleteStaff = async (id: string): Promise<void> => {
  const response = await fetchApi(`/admin/staff/${id}`, { method: "DELETE" });
  if (!response.success) {
    throw new Error(response.message || "Failed to delete staff");
  }
};

export const toggleStaffStatus = async (
  id: string,
  isActive: boolean,
): Promise<StaffMember> => {
  return updateStaff(id, { isActive: !isActive });
};

// API object pour compatibilité
export const adminStaffApi = {
  getAll: getAllStaff,
  getById: getStaffById,
  create: createStaff,
  update: updateStaff,
  delete: deleteStaff,
  toggleStatus: toggleStaffStatus,
};

export const adminStaffAPI = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  toggleStaffStatus,
};

export default adminStaffApi;
