// frontend/src/stores/designStore.ts

import { create } from "zustand";
import api from "../api/client";

export interface Design {
  _id: string;
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  price: number;
  thumbnail?: string;
  images?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface DesignStore {
  designs: Design[];
  currentDesign: Design | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;

  fetchDesigns: (page?: number, limit?: number, filters?: any) => Promise<void>;
  fetchDesignById: (id: string) => Promise<void>;
  createDesign: (data: Partial<Design>) => Promise<Design>;
  updateDesign: (id: string, data: Partial<Design>) => Promise<void>;
  deleteDesign: (id: string) => Promise<void>;
}

export const useDesignStore = create<DesignStore>((set, get) => ({
  designs: [],
  currentDesign: null,
  isLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,

  fetchDesigns: async (page = 1, limit = 10, filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/designs", { params: { page, limit, ...filters } });
      set({
        designs: response.data.data || response.data,
        totalPages: response.data.pagination?.pages || 1,
        currentPage: page,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors du chargement des designs",
        isLoading: false,
      });
    }
  },

  fetchDesignById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/designs/${id}`);
      set({ currentDesign: response.data.data || response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors du chargement du design",
        isLoading: false,
      });
    }
  },

  createDesign: async (data: Partial<Design>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/designs", data);
      set({ isLoading: false });
      return response.data.data || response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors de la création du design",
        isLoading: false,
      });
      throw error;
    }
  },

  updateDesign: async (id: string, data: Partial<Design>) => {
    set({ isLoading: true, error: null });
    try {
      await api.patch(`/designs/${id}`, data);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors de la mise à jour du design",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteDesign: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/designs/${id}`);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors de la suppression du design",
        isLoading: false,
      });
      throw error;
    }
  },
}));