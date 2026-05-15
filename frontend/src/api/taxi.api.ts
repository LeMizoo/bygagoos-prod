import axiosInstance from './axiosInstance';

const API_BASE = '/taxi';

export const taxiApi = {
  // Vehicles
  getVehicles: async (page = 1, limit = 10) => {
    const { data } = await axiosInstance.get(`${API_BASE}/vehicles`, {
      params: { page, limit }
    });
    return data;
  },

  getVehicleById: async (id: string) => {
    const { data } = await axiosInstance.get(`${API_BASE}/vehicles/${id}`);
    return data;
  },

  createVehicle: async (vehicleData: any) => {
    const { data } = await axiosInstance.post(`${API_BASE}/vehicles`, vehicleData);
    return data;
  },

  // Trips
  getTodayTrips: async () => {
    const { data } = await axiosInstance.get(`${API_BASE}/trips/today`);
    return data;
  },

  createTrip: async (tripData: any) => {
    const { data } = await axiosInstance.post(`${API_BASE}/trips`, tripData);
    return data;
  },

  updateTripStatus: async (tripId: string, status: string) => {
    const { data } = await axiosInstance.patch(`${API_BASE}/trips/${tripId}/status`, {
      status
    });
    return data;
  },

  // Maintenance
  getMaintenanceDueSoon: async (days = 7) => {
    const { data } = await axiosInstance.get(`${API_BASE}/maintenance/due-soon`, {
      params: { days }
    });
    return data;
  },

  // Stats
  getFleetStats: async () => {
    const { data } = await axiosInstance.get(`${API_BASE}/stats`);
    return data;
  }
};

export default taxiApi;
