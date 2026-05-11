import axiosInstance from './axiosInstance';

const API_BASE = '/api/restaurant';

export const restaurantApi = {
  // Tables
  getTables: async () => {
    const { data } = await axiosInstance.get(`${API_BASE}/tables`);
    return data;
  },

  updateTableStatus: async (tableId: string, status: string, occupiedBy?: any) => {
    const { data } = await axiosInstance.patch(`${API_BASE}/tables/${tableId}/status`, {
      status,
      occupiedBy
    });
    return data;
  },

  // Reservations
  getReservations: async (page = 1, limit = 10) => {
    const { data } = await axiosInstance.get(`${API_BASE}/reservations`, {
      params: { page, limit }
    });
    return data;
  },

  getTodayReservations: async () => {
    const { data } = await axiosInstance.get(`${API_BASE}/reservations/today`);
    return data;
  },

  createReservation: async (reservationData: any) => {
    const { data } = await axiosInstance.post(`${API_BASE}/reservations`, reservationData);
    return data;
  },

  // Menu
  getMenu: async (category?: string) => {
    const { data } = await axiosInstance.get(`${API_BASE}/menu`, {
      params: { category }
    });
    return data;
  },

  getFeaturedMenu: async () => {
    const { data } = await axiosInstance.get(`${API_BASE}/menu/featured`);
    return data;
  },

  // Stock
  getStockAlerts: async () => {
    const { data } = await axiosInstance.get(`${API_BASE}/stock/alerts`);
    return data;
  },

  // Stats
  getRestaurantStats: async () => {
    const { data } = await axiosInstance.get(`${API_BASE}/stats`);
    return data;
  }
};

export default restaurantApi;
