// frontend/src/api/adminOrders.api.ts
import { API_URL } from "./index";
import { dev } from '../utils/devLogger';

export interface Order {
  _id: string;
  clientId: string;
  items: { product: string; quantity: number }[];
  totalPrice?: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";
  createdAt?: string;
  updatedAt?: string;
}

interface OrderResponse {
  success: boolean;
  data: Order | Order[];
  message?: string;
}

const getToken = (): string | null => localStorage.getItem("token");
const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

const fetchWithAuth = async <T>(
  url: string,
  options: RequestInit = {},
): Promise<T> => {
  const headers = { ...getHeaders(), ...options.headers };
  const fullUrl = `${API_URL}${url}`;
  dev.log(`🌐 Orders API: ${fullUrl}`);
  const res = await fetch(fullUrl, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erreur HTTP ${res.status}`);
  }
  return res.json();
};

export const adminOrdersApi = {
  // Routes SANS /api
  getAll: async (): Promise<Order[]> => {
    const res = await fetchWithAuth<OrderResponse>("/admin/orders");
    const data = res.data;
    return Array.isArray(data) ? data : [data];
  },
  getById: async (id: string): Promise<Order> => {
    const res = await fetchWithAuth<OrderResponse>(`/admin/orders/${id}`);
    return res.data as Order;
  },
  create: async (data: Partial<Order>): Promise<Order> => {
    const res = await fetchWithAuth<OrderResponse>("/admin/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data as Order;
  },
  update: async (id: string, data: Partial<Order>): Promise<Order> => {
    const res = await fetchWithAuth<OrderResponse>(`/admin/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return res.data as Order;
  },
  delete: async (id: string): Promise<void> => {
    await fetchWithAuth(`/admin/orders/${id}`, { method: "DELETE" });
  },
};

export default adminOrdersApi;
