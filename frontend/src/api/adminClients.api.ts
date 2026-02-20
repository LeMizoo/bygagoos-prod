// frontend/src/api/adminClients.api.ts
import { API_URL, getAuthHeaders } from "./index";

interface ClientResponse {
  success: boolean;
  data: Client | Client[];
  message?: string;
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

export interface CreateClientData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  notes?: string;
  status?: "active" | "inactive" | "pending";
}

export interface UpdateClientData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  notes?: string;
  status?: "active" | "inactive" | "pending";
}

const getToken = (): string | null => localStorage.getItem("token");
const getHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

// Fetch avec URL absolue
const fetchWithAuth = async <T>(
  url: string,
  options: RequestInit = {},
): Promise<T> => {
  const headers = { ...getHeaders(), ...options.headers };

  // Transformation des URLs /admin/xxx → /xxx
  let transformedUrl = url;
  if (transformedUrl.includes('/admin/')) {
    transformedUrl = transformedUrl.replace('/admin/', '/');
  }

  const fullUrl = `${API_URL}${transformedUrl}`;
  console.log(`🌐 Clients API: ${fullUrl}`);
  const res = await fetch(fullUrl, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erreur HTTP ${res.status}`);
  }
  return res.json();
};

const transformClientData = (data: any): Client => {
  const name = data.name || "";
  const nameParts = name.split(" ");
  const firstName = data.firstName || nameParts[0] || "";
  const lastName =
    data.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");
  return {
    _id: data._id || data.id,
    firstName,
    lastName,
    email: data.email || "",
    phone: data.phone || "",
    address: data.address || "",
    company: data.company || "",
    notes: data.notes || "",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    totalOrders: data.totalOrders || 0,
    totalSpent: data.totalSpent || 0,
    status: data.status || "active",
  };
};

export const adminClientsApi = {
  // Routes SANS /api
  getAll: async (): Promise<Client[]> => {
    try {
      const res = await fetchWithAuth<ClientResponse>("/admin/clients");
      const data = res.data;
      return Array.isArray(data) ? data.map(transformClientData) : [];
    } catch (error) {
      console.error("Error fetching clients:", error);
      return [];
    }
  },
  getById: async (id: string): Promise<Client> => {
    const res = await fetchWithAuth<ClientResponse>(`/admin/clients/${id}`);
    return transformClientData(res.data);
  },
  create: async (data: CreateClientData): Promise<Client> => {
    const res = await fetchWithAuth<ClientResponse>("/admin/clients", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return transformClientData(res.data);
  },
  update: async (id: string, data: UpdateClientData): Promise<Client> => {
    const res = await fetchWithAuth<ClientResponse>(`/admin/clients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return transformClientData(res.data);
  },
  delete: async (id: string): Promise<void> => {
    await fetchWithAuth(`/admin/clients/${id}`, { method: "DELETE" });
  },
  toggleStatus: async (
    id: string,
    status: "active" | "inactive",
  ): Promise<Client> => {
    const res = await fetchWithAuth<ClientResponse>(
      `/admin/clients/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
    );
    return transformClientData(res.data);
  },
  // Compatibilité
  getAllClients: async (): Promise<Client[]> => adminClientsApi.getAll(),
  createClient: async (data: CreateClientData): Promise<Client> =>
    adminClientsApi.create(data),
  updateClient: async (id: string, data: UpdateClientData): Promise<Client> =>
    adminClientsApi.update(id, data),
  deleteClient: async (id: string): Promise<void> => adminClientsApi.delete(id),
  toggleClientStatus: async (
    id: string,
    status: "active" | "inactive",
  ): Promise<Client> => adminClientsApi.toggleStatus(id, status),
};

export default adminClientsApi;
