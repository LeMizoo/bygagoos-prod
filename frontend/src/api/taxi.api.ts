import axiosInstance from './axiosInstance';
import type { 
  CreateTaxiVehicleDto, 
  UpdateTaxiVehicleDto,
  CreateDriverDto,
  UpdateDriverDto,
  CreateTripDto
} from '../types/taxi';

const API_BASE = '/taxi';

export const taxiApi = {
  // ==================== VÉHICULES ====================
  getVehicles: async (page = 1, limit = 10, status?: string) => {
    const { data } = await axiosInstance.get(`${API_BASE}/vehicles`, {
      params: { page, limit, status }
    });
    return data;
  },

  getVehicleById: async (id: string) => {
    const { data } = await axiosInstance.get(`${API_BASE}/vehicles/${id}`);
    return data;
  },

  createVehicle: async (vehicleData: CreateTaxiVehicleDto) => {
    const { data } = await axiosInstance.post(`${API_BASE}/vehicles`, vehicleData);
    return data;
  },

  updateVehicle: async (id: string, vehicleData: UpdateTaxiVehicleDto) => {
    const { data } = await axiosInstance.put(`${API_BASE}/vehicles/${id}`, vehicleData);
    return data;
  },

  deleteVehicle: async (id: string) => {
    const { data } = await axiosInstance.delete(`${API_BASE}/vehicles/${id}`);
    return data;
  },

  getVehicleStats: async () => {
    const { data } = await axiosInstance.get(`${API_BASE}/vehicles/stats`);
    return data;
  },

  // ==================== CONDUCTEURS ====================
  getDrivers: async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const { data } = await axiosInstance.get(`${API_BASE}/drivers`, { params });
    return data;
  },

  getDriverById: async (id: string) => {
    const { data } = await axiosInstance.get(`${API_BASE}/drivers/${id}`);
    return data;
  },

  createDriver: async (driverData: CreateDriverDto) => {
    const { data } = await axiosInstance.post(`${API_BASE}/drivers`, driverData);
    return data;
  },

  updateDriver: async (id: string, driverData: UpdateDriverDto) => {
    const { data } = await axiosInstance.put(`${API_BASE}/drivers/${id}`, driverData);
    return data;
  },

  deleteDriver: async (id: string) => {
    const { data } = await axiosInstance.delete(`${API_BASE}/drivers/${id}`);
    return data;
  },

  getDriverStats: async () => {
    const { data } = await axiosInstance.get(`${API_BASE}/drivers/stats`);
    return data;
  },

  assignVehicleToDriver: async (driverId: string, vehicleId: string) => {
    const { data } = await axiosInstance.post(`${API_BASE}/drivers/assign-vehicle`, { driverId, vehicleId });
    return data;
  },

  unassignVehicleFromDriver: async (driverId: string) => {
    const { data } = await axiosInstance.post(`${API_BASE}/drivers/${driverId}/unassign-vehicle`);
    return data;
  },

  updateDriverStatus: async (driverId: string, status: string) => {
    const { data } = await axiosInstance.patch(`${API_BASE}/drivers/${driverId}/status`, { status });
    return data;
  },

  // ==================== TRAJETS ====================
  getTodayTrips: async () => {
    const { data } = await axiosInstance.get(`${API_BASE}/trips/today`);
    return data;
  },

  createTrip: async (tripData: CreateTripDto) => {
    const { data } = await axiosInstance.post(`${API_BASE}/trips`, tripData);
    return data;
  },

  updateTripStatus: async (tripId: string, status: string) => {
    const { data } = await axiosInstance.patch(`${API_BASE}/trips/${tripId}/status`, { status });
    return data;
  },

  // ==================== MAINTENANCE & STATS ====================
  getMaintenanceDueSoon: async (days = 7) => {
    const { data } = await axiosInstance.get(`${API_BASE}/maintenance/due-soon`, {
      params: { days }
    });
    return data;
  },

  getFleetStats: async () => {
    const { data } = await axiosInstance.get(`${API_BASE}/stats`);
    return data;
  }
};

export default taxiApi;