// frontend/src/api/dashboard.api.ts

import { Order } from '../types/order';
import { Client } from '../types/client';
// 🔥 CORRECTION: Importer devLogger
import { dev } from '../utils/devLogger';
// 🔥 CORRECTION: Importer apiFetch ou l'instance axios
import { apiFetch } from './index';

export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  orderStatus?: string;
  period?: 'day' | 'week' | 'month' | 'year';
}

export interface RevenueStats {
  thisPeriod: number;
  previousPeriod: number;
  thisMonth?: number;
  lastMonth?: number;
  total?: number;
  ordersThisPeriod: number;
  history: {
    date: string;
    amount: number;
  }[];
  byDay?: Array<{ date: string; montant: number }>;
}

export interface OrdersStats {
  active: number;
  completed: number;
  total?: number;
  thisPeriod: number;
  previousPeriod: number;
  byStatus: {
    draft: number;
    confirmed: number;
    inProgress: number;
    completed: number;
  };
  history: {
    date: string;
    count: number;
  }[];
}

export interface DesignsStats {
  active: number;
  draft: number;
  total?: number;
  popular: {
    id: string;
    title: string;
    status: string;
    viewCount: number;
    orderCount: number;
  }[];
}

export interface AdminStats {
  orders: OrdersStats;
  revenue: RevenueStats;
  designs: DesignsStats;
  clients?: {
    total?: number;
    active?: number;
    newThisMonth?: number;
  };
  recentOrders: Order[];
  recentClients: Client[];
  alerts?: string[];
}

export const dashboardApi = {
  /**
   * Récupère les statistiques pour l'admin
   */
  getAdminStats: async (period: string = 'week', filters?: DashboardFilters) => {
    dev.log('🌐 Dashboard API: GET /dashboard/admin-stats', { period, filters });
    
    const params = new URLSearchParams();
    params.append('period', period);
    
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.orderStatus) params.append('orderStatus', filters.orderStatus);
    
    // 🔥 CORRECTION: Utiliser apiFetch au lieu de api.get()
    const response = await apiFetch<AdminStats>(`/dashboard/admin-stats?${params.toString()}`);
    return response.data;
  },

  /**
   * Récupère les statistiques pour un manager
   */
  getManagerStats: async (period: string = 'week') => {
    dev.log('🌐 Dashboard API: GET /dashboard/manager-stats', { period });
    // 🔥 CORRECTION: Utiliser apiFetch au lieu de api.get()
    const response = await apiFetch(`/dashboard/manager-stats?period=${period}`);
    return response.data;
  },

  /**
   * Récupère les statistiques pour un designer
   */
  getDesignerStats: async (period: string = 'week') => {
    dev.log('🌐 Dashboard API: GET /dashboard/designer-stats', { period });
    // 🔥 CORRECTION: Utiliser apiFetch au lieu de api.get()
    const response = await apiFetch(`/dashboard/designer-stats?period=${period}`);
    return response.data;
  },

  /**
   * Récupère les données d'activité récente
   */
  getRecentActivity: async (limit: number = 10) => {
    dev.log('🌐 Dashboard API: GET /dashboard/recent-activity', { limit });
    // 🔥 CORRECTION: Utiliser apiFetch au lieu de api.get()
    const response = await apiFetch(`/dashboard/recent-activity?limit=${limit}`);
    return response.data;
  },

  /**
   * Récupère les métriques en temps réel
   */
  getRealtimeMetrics: async () => {
    dev.log('🌐 Dashboard API: GET /dashboard/realtime');
    // 🔥 CORRECTION: Utiliser apiFetch au lieu de api.get()
    const response = await apiFetch('/dashboard/realtime');
    return response.data;
  }
};

export default dashboardApi;