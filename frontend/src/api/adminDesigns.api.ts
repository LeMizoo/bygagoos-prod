import { axiosInstance } from './axiosInstance';
import { dev } from '../utils/devLogger';
import type {
  Design,
  UpdateDesignDto,
  DesignFilters,
  apiResponse,
  PaginatedResponse,
} from "../types";

export type { Design };

const backendStatusFromUi = (status: "active" | "inactive" | "archived") => {
  switch (status) {
    case "active":
      return "APPROVED";
    case "inactive":
      return "REJECTED";
    case "archived":
      return "ARCHIVED";
    default:
      return "APPROVED";
  }
};

type AdminDesignCreateInput = {
  title: string;
  description?: string;
  type: string;
  category?: string;
  basePrice?: number;
  status?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
};

export const adminDesignsApi = {
  getAllDesigns: async (
    params?: DesignFilters & {
      page?: number;
      limit?: number;
      sortBy?: string;
      order?: "asc" | "desc";
    },
  ): Promise<PaginatedResponse<Design>> => {
    dev.log('🌐 Designs API: GET /api/designs', params);
    const response = await axiosInstance.get('/designs', { params });
    return response.data;
  },

  getDesignById: async (id: string): Promise<apiResponse<Design>> => {
    dev.log(`🌐 Designs API: GET /api/designs/${id}`);
    const response = await axiosInstance.get(`/designs/${id}`);
    return response.data;
  },

  createDesign: async (
    designData: AdminDesignCreateInput,
  ): Promise<apiResponse<Design>> => {
    dev.log('🌐 Designs API: POST /api/designs');
    const response = await axiosInstance.post('/designs', {
      ...designData,
      metadata: {
        ...(designData.metadata || {}),
        category: designData.category,
        basePrice: designData.basePrice,
      },
    });
    return response.data;
  },

  updateDesign: async (
    id: string,
    designData: UpdateDesignDto,
  ): Promise<apiResponse<Design>> => {
    dev.log(`🌐 Designs API: PUT /api/designs/${id}`);
    const response = await axiosInstance.put(`/designs/${id}`, designData);
    return response.data;
  },

  deleteDesign: async (id: string): Promise<apiResponse<void>> => {
    dev.log(`🌐 Designs API: DELETE /api/designs/${id}`);
    const response = await axiosInstance.delete(`/designs/${id}`);
    return response.data;
  },

  updateDesignStatus: async (
    id: string,
    status: "active" | "inactive" | "archived",
  ): Promise<apiResponse<Design>> => {
    dev.log(`🌐 Designs API: PUT /api/designs/${id}`);
    const response = await axiosInstance.put(`/designs/${id}`, {
      status: backendStatusFromUi(status),
    });
    return response.data;
  },

  getDesignStats: async (): Promise<
    apiResponse<{
      total: number;
      byStatus: Record<string, number>;
      byCategory: Record<string, number>;
      byStyle: Record<string, number>;
      revenue: { totalRevenue: number; avgPrice: number };
      popular: Design[];
    }>
  > => {
    dev.log('🌐 Designs API: GET /api/designs/stats');
    const response = await axiosInstance.get('/designs/stats');
    return response.data;
  },

  uploadDesignImages: async (
    id: string,
    images: File[],
  ): Promise<apiResponse<Design>> => {
    dev.log(`🌐 Designs API: POST /api/designs/${id}/files`);
    const formData = new FormData();
    images.forEach((file) => formData.append("files", file));

    const response = await axiosInstance.post(`/designs/${id}/files`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
