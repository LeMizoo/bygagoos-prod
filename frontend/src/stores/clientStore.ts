// frontend/src/stores/clientStore.ts

import { create } from "zustand";
import api from "../api/client";

export interface Client {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ClientStore {
  clients: Client[];
  currentClient: Client | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;

  fetchClients: (page?: number, limit?: number, filters?: any) => Promise<void>;
  fetchClientById: (id: string) => Promise<void>;
  createClient: (data: Partial<Client>) => Promise<Client>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
}

const extractClientsList = (payload: unknown): Client[] => {
  if (Array.isArray(payload)) {
    return payload as Client[];
  }

  if (payload && typeof payload === 'object') {
    const maybeClients = (payload as { clients?: unknown }).clients;
    if (Array.isArray(maybeClients)) {
      return maybeClients as Client[];
    }
  }

  return [];
};

export const useClientStore = create<ClientStore>((set, get) => ({
  clients: [],
  currentClient: null,
  isLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,

  fetchClients: async (page = 1, limit = 10, filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/clients", { params: { page, limit, ...filters } });
      const payload = response.data?.data ?? response.data;
      set({
        clients: extractClientsList(payload),
        totalPages: response.data.pagination?.totalPages || 1,
        currentPage: page,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors du chargement des clients",
        isLoading: false,
      });
    }
  },

  fetchClientById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/clients/${id}`);
      set({ currentClient: response.data.data || response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors du chargement du client",
        isLoading: false,
      });
    }
  },

  createClient: async (data: Partial<Client>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/clients", data);
      set({ isLoading: false });
      return response.data.data || response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors de la création du client",
        isLoading: false,
      });
      throw error;
    }
  },

  updateClient: async (id: string, data: Partial<Client>) => {
    set({ isLoading: true, error: null });
    try {
      await api.patch(`/clients/${id}`, data);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors de la mise à jour du client",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteClient: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/clients/${id}`);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors de la suppression du client",
        isLoading: false,
      });
      throw error;
    }
  },
}));