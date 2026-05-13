import axiosInstance from './axiosInstance';
import type {
  RestaurantStats,
  Table,
  Reservation,
  MenuItem,
  StockAlert,
} from '../types/restaurant';

const API_BASE = '/restaurant';

export const restaurantApi = {
  getTables: async (): Promise<{ tables: Table[] }> => {
    const { data } = await axiosInstance.get(`${API_BASE}/tables`);
    return data;
  },

  updateTableStatus: async (tableId: string, status: string, occupiedBy?: string | null): Promise<Table> => {
    const { data } = await axiosInstance.patch(`${API_BASE}/tables/${tableId}/status`, {
      status,
      occupiedBy,
    });
    return data;
  },

  getReservations: async (page = 1, limit = 10): Promise<{ reservations: Reservation[]; total: number; page: number; pages: number }> => {
    const { data } = await axiosInstance.get(`${API_BASE}/reservations`, {
      params: { page, limit },
    });
    return data;
  },

  getTodayReservations: async (): Promise<{ reservations: Reservation[] }> => {
    const { data } = await axiosInstance.get(`${API_BASE}/reservations/today`);
    // Le backend renvoie déjà des objets avec id, name, time, table, status
    return data;
  },

  createReservation: async (reservationData: any): Promise<Reservation> => {
    const { data } = await axiosInstance.post(`${API_BASE}/reservations`, reservationData);
    return data;
  },

  getMenu: async (category?: string): Promise<{ menuItems: MenuItem[] }> => {
    const { data } = await axiosInstance.get(`${API_BASE}/menu`, {
      params: { category },
    });
    return data;
  },

  getFeaturedMenu: async (): Promise<MenuItem[]> => {
    const { data } = await axiosInstance.get(`${API_BASE}/menu/featured`);
    return data;
  },

  getStockAlerts: async (): Promise<StockAlert[]> => {
    const { data } = await axiosInstance.get(`${API_BASE}/stock/alerts`);
    // Transformation car le backend renvoie { _id, message }
    return (data as any[]).map((item) => ({
      id: item._id,
      message: item.message,
    }));
  },

  getRestaurantStats: async (): Promise<RestaurantStats> => {
    const { data } = await axiosInstance.get(`${API_BASE}/stats`);
    return data;
  },
};

export default restaurantApi;