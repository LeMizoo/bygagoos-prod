import axiosInstance from "./axiosInstance";

// -----------------------------
// Types des stats
// -----------------------------
export interface SuperAdminStats {
  users: {
    total: number;
    admins: number;
    regular: number;
  };
  orders: {
    total: number;
    byStatus: {
      draft: number;
      confirmed: number;
      inProgress: number;
      completed: number;
      cancelled: number;
    };
    recentOrders7days: number;
  };
  revenue: {
    total: number;
    average: number;
  };
  designs: {
    total: number;
    active: number;
    draft: number;
  };
  clients: {
    total: number;
  };
  staff: {
    total: number;
    active: number;
  };
  topClients: any[];
  topDesigns: any[];
  salesByDay: any[];
}

export interface AdminStats {
  orders: {
    active: number;
    completed: number;
    byStatus: {
      draft: number;
      confirmed: number;
      inProgress: number;
    };
  };
  designs: {
    active: number;
    draft: number;
    popular: any[];
  };
  revenue: {
    thisWeek: number;
    ordersThisWeek: number;
  };
  recentClients: any[];
  recentOrders: any[];
}

export interface UserStats {
  orders: {
    total: number;
    completed: number;
    active: number;
  };
  spending: {
    total: number;
    average: number;
  };
  clients: number;
  designs: number;
  recentOrders: any[];
}

// -----------------------------
// API calls
// -----------------------------
export const dashboardApi = {
  // -----------------------------
  // Super Admin
  // -----------------------------
  getSuperAdminStats: async (): Promise<SuperAdminStats> => {
    const response = await axiosInstance.get<{ data: SuperAdminStats }>(
      "/dashboard/super-admin-stats",
    );
    return response.data.data; // retourne directement les stats
  },

  // -----------------------------
  // Admin
  // -----------------------------
  getAdminStats: async (): Promise<AdminStats> => {
    const response = await axiosInstance.get<{ data: AdminStats }>(
      "/dashboard/admin-stats",
    );
    return response.data.data;
  },

  // -----------------------------
  // User
  // -----------------------------
  getUserStats: async (): Promise<UserStats> => {
    const response = await axiosInstance.get<{ data: UserStats }>(
      "/dashboard/user-stats",
    );
    return response.data.data;
  },
};
