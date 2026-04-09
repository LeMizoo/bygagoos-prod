// frontend/src/api/orderApi.ts

import api from "./client";

export const orderApi = {
  // Récupérer les commandes avec filtres
  getOrders: async (params?: any) => {
    const response = await api.get("/orders", { params });
    return response.data;
  },

  // Récupérer une commande par ID
  getOrderById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Créer une commande
  createOrder: async (data: any) => {
    const response = await api.post("/orders", data);
    return response.data;
  },

  // Mettre à jour une commande
  updateOrder: async (id: string, data: any) => {
    const response = await api.patch(`/orders/${id}`, data);
    return response.data;
  },

  // Supprimer une commande
  deleteOrder: async (id: string) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },

  // Mettre à jour le statut
  updateOrderStatus: async (id: string, status: string) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Assigner une commande
  assignOrder: async (id: string, assignedTo: string[]) => {
    const response = await api.patch(`/orders/${id}/assign`, { assignedTo });
    return response.data;
  },

  // Ajouter un message
  addMessage: async (id: string, message: { content: string; attachments?: any[] }) => {
    const response = await api.post(`/orders/${id}/messages`, message);
    return response.data;
  },

  // Marquer les messages comme lus
  markMessagesAsRead: async (id: string) => {
    const response = await api.patch(`/orders/${id}/messages/read`);
    return response.data;
  },

  // Statistiques
  getOrderStats: async () => {
    const response = await api.get("/orders/stats");
    return response.data;
  },

  // Commandes par client
  getOrdersByClient: async (clientId: string) => {
    const response = await api.get(`/orders/client/${clientId}`);
    return response.data;
  },

  // Télécharger la facture
  downloadInvoice: async (id: string) => {
    const response = await api.get(`/orders/${id}/invoice`, {
      responseType: 'blob'
    });
    return response.data;
  }
};