// frontend/src/stores/orderStore.ts

import { create } from "zustand";
import { orderApi } from "../api/orderApi";

export interface Order {
  _id: string;
  id: string;
  orderNumber: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  client: any;
  designs: any[];
  price: {
    subtotal: number;
    taxRate: number;
    tax: number;
    discount?: {
      type: string;
      value: number;
      reason?: string;
    };
    total: number;
    currency: string;
  };
  payment?: {
    status: string;
    method?: string;
    dueDate?: string;
    paidAt?: string;
  };
  assignedTo?: {
    designer?: string;
    validator?: string;
    producer?: string;
  };
  messages?: any[];
  history?: any[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  requestedDate?: string;
  deadline?: string;
  completedAt?: string;
}

const unwrapApiData = <T,>(response: any): T => {
  if (!response) return response as T;
  const payload = response.data ?? response;
  return (payload?.data ?? payload) as T;
};

const extractOrdersList = (response: any): Order[] => {
  const data = unwrapApiData<any>(response);
  if (Array.isArray(data)) return data as Order[];
  if (Array.isArray(data?.orders)) return data.orders as Order[];
  if (Array.isArray(data?.data?.orders)) return data.data.orders as Order[];
  return [];
};

const extractPagination = (response: any) => {
  const data = unwrapApiData<any>(response);
  return data?.pagination ?? data?.data?.pagination ?? null;
};

interface OrderStore {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: Record<string, any>;
  setFilters: (filters: Record<string, any>) => void;
  totalPages: number;
  currentPage: number;
  stats: any | null;

  fetchOrders: (page?: number, limit?: number, filters?: any) => Promise<void>;
  fetchOrderById: (id: string) => Promise<void>;
  fetchOrdersByClient: (clientId: string) => Promise<void>;
  createOrder: (data: Partial<Order>) => Promise<Order>;
  updateOrder: (id: string, data: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  assignOrder: (id: string, assignedTo: string[]) => Promise<void>;
  addMessage: (id: string, message: { content: string; attachments?: any[] }) => Promise<void>;
  fetchOrderStats: () => Promise<void>;
  fetchStats: () => Promise<void>;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, pages: 1 },
  filters: {},
  totalPages: 1,
  currentPage: 1,
  stats: null,

  fetchOrders: async (page = 1, limit = 10, filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.getOrders({ page, limit, ...filters });
      const orders = extractOrdersList(response);
      const pagination = extractPagination(response);
      set({
        orders,
        totalPages: pagination?.pages || 1,
        currentPage: page,
        pagination: {
          page,
          limit: limit || 10,
          total: pagination?.total || orders.length || 0,
          pages: pagination?.pages || 1,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors du chargement des commandes",
        isLoading: false,
      });
    }
  },

  fetchOrderById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.getOrderById(id);
      set({ currentOrder: unwrapApiData<Order>(response), isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors du chargement de la commande",
        isLoading: false,
      });
    }
  },

  // ✅ Nouvelle méthode pour les commandes par client
  fetchOrdersByClient: async (clientId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.getOrdersByClient(clientId);
      set({ 
        orders: extractOrdersList(response), 
        isLoading: false 
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors du chargement des commandes",
        isLoading: false,
      });
    }
  },

  createOrder: async (data: Partial<Order>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.createOrder(data);
      set({ isLoading: false });
      return unwrapApiData<Order>(response);
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors de la création de la commande",
        isLoading: false,
      });
      throw error;
    }
  },

  updateOrder: async (id: string, data: Partial<Order>) => {
    set({ isLoading: true, error: null });
    try {
      await orderApi.updateOrder(id, data);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors de la mise à jour de la commande",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteOrder: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await orderApi.deleteOrder(id);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors de la suppression de la commande",
        isLoading: false,
      });
      throw error;
    }
  },

  updateOrderStatus: async (id: string, status: string) => {
    set({ isLoading: true, error: null });
    try {
      await orderApi.updateOrderStatus(id, status);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors de la mise à jour du statut",
        isLoading: false,
      });
      throw error;
    }
  },

  assignOrder: async (id: string, assignedTo: string[]) => {
    set({ isLoading: true, error: null });
    try {
      await orderApi.assignOrder(id, assignedTo);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors de l'assignation",
        isLoading: false,
      });
      throw error;
    }
  },

  setFilters: (filters) => {
    set({ filters });
  },

  addMessage: async (id: string, message: { content: string; attachments?: any[] }) => {
    set({ isLoading: true, error: null });
    try {
      await orderApi.addMessage(id, message);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors de l'ajout du message",
        isLoading: false,
      });
      throw error;
    }
  },

  fetchOrderStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.getOrderStats();
      set({ stats: unwrapApiData(response), isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors du chargement des statistiques",
        isLoading: false,
      });
    }
  },

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.getOrderStats();
      set({ stats: unwrapApiData(response), isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors du chargement des statistiques",
        isLoading: false,
      });
    }
  },
}));
