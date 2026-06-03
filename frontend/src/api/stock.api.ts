import axiosInstance from './axiosInstance';
import type { StockItem, StockMovement, StockStats, CreateStockItemDto } from '../types/restaurant';

const API_BASE = '/restaurant';

export const stockApi = {
  // Récupérer tous les produits
  getStockItems: async (params?: { category?: string; alertLevel?: string }): Promise<{ items: StockItem[]; total: number }> => {
    const { data } = await axiosInstance.get(`${API_BASE}/stock`, { params });
    return data;
  },

  // Récupérer un produit par ID
  getStockItemById: async (id: string): Promise<StockItem> => {
    const { data } = await axiosInstance.get(`${API_BASE}/stock/${id}`);
    return data;
  },

  // Créer un produit
  createStockItem: async (itemData: CreateStockItemDto): Promise<StockItem> => {
    const { data } = await axiosInstance.post(`${API_BASE}/stock`, itemData);
    return data;
  },

  // Mettre à jour un produit
  updateStockItem: async (id: string, itemData: Partial<CreateStockItemDto>): Promise<StockItem> => {
    const { data } = await axiosInstance.put(`${API_BASE}/stock/${id}`, itemData);
    return data;
  },

  // Supprimer un produit
  deleteStockItem: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_BASE}/stock/${id}`);
  },

  // Mouvement de stock (entrée/sortie)
  createStockMovement: async (movement: { itemId: string; type: 'IN' | 'OUT'; quantity: number; reason: string; note?: string }): Promise<StockMovement> => {
    const { data } = await axiosInstance.post(`${API_BASE}/stock/movements`, movement);
    return data;
  },

  // Historique des mouvements
  getStockMovements: async (itemId?: string, limit = 50): Promise<StockMovement[]> => {
    const { data } = await axiosInstance.get(`${API_BASE}/stock/movements`, { params: { itemId, limit } });
    return data;
  },

  // Statistiques des stocks
  getStockStats: async (): Promise<StockStats> => {
    const { data } = await axiosInstance.get(`${API_BASE}/stock/stats`);
    return data;
  },

  // Suggestions de réapprovisionnement
  getRestockSuggestions: async (): Promise<StockItem[]> => {
    const { data } = await axiosInstance.get(`${API_BASE}/stock/restock-suggestions`);
    return data;
  },
};