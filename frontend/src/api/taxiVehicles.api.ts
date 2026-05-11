import api from "./client";
import type { apiResponse } from "../types";
import type { CreateTaxiVehicleDto, TaxiVehicle, TaxiVehicleStats, UpdateTaxiVehicleDto } from "../types/taxi";

interface TaxiVehiclesPayload {
  vehicles?: TaxiVehicle[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

const extractData = <T>(responseData: unknown): T => {
  if (responseData && typeof responseData === "object" && "data" in responseData) {
    return ((responseData as { data?: T }).data ?? responseData) as T;
  }

  return responseData as T;
};

export const taxiVehiclesApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<TaxiVehicle[]> => {
    const response = await api.get("/taxi/vehicles", { params });
    const payload = extractData<TaxiVehiclesPayload>(response.data);
    return Array.isArray(payload?.vehicles) ? payload.vehicles : [];
  },

  getStats: async (): Promise<TaxiVehicleStats> => {
    const response = await api.get("/taxi/vehicles/stats");
    const payload = extractData<TaxiVehicleStats>(response.data);
    return payload;
  },

  create: async (data: CreateTaxiVehicleDto): Promise<TaxiVehicle> => {
    const response = await api.post("/taxi/vehicles", data);
    const payload = extractData<TaxiVehicle>(response.data);
    return payload;
  },

  update: async (id: string, data: UpdateTaxiVehicleDto): Promise<TaxiVehicle> => {
    const response = await api.put(`/taxi/vehicles/${id}`, data);
    const payload = extractData<TaxiVehicle>(response.data);
    return payload;
  },

  delete: async (id: string): Promise<apiResponse<void>> => {
    const response = await api.delete(`/taxi/vehicles/${id}`);
    return response.data;
  },
};

export default taxiVehiclesApi;
