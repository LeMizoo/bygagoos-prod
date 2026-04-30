// frontend/src/api/adminDesigns.api.ts

import { axiosInstance } from './axiosInstance';
import { dev } from '../utils/devLogger';
import type {
  Design,
  CreateDesignDto,
  UpdateDesignDto,
  DesignFilters,
  apiResponse,
  PaginatedResponse,
} from "../types";

export type { Design };

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
    designData: CreateDesignDto,
  ): Promise<apiResponse<Design>> => {
    dev.log('🌐 Designs API: POST /api/designs');
    const formData = new FormData();

    const textFields = [
      "title", "description", "category", "style",
      "printType", "printArea", "notes"
    ];
    textFields.forEach((field) => {
      const value = (designData as any)[field];
      if (value !== undefined && value !== null && value !== "") {
        formData.append(field, String(value));
      }
    });

    if (designData.status) formData.append("status", designData.status);
    if (designData.basePrice !== undefined) formData.append("basePrice", designData.basePrice.toString());
    if (designData.minQuantity !== undefined) formData.append("minQuantity", designData.minQuantity.toString());
    if (designData.productionTime !== undefined) formData.append("productionTime", designData.productionTime.toString());
    if (designData.colors?.length) formData.append("colors", JSON.stringify(designData.colors));
    if (designData.sizes?.length) formData.append("sizes", JSON.stringify(designData.sizes));
    if (designData.tags?.length) formData.append("tags", JSON.stringify(designData.tags));

    if (designData.images?.length) {
      designData.images.forEach((file, index) => {
        formData.append("images", file);
        if (index === 0) formData.append("thumbnailIndex", "0");
      });
    }

    const response = await axiosInstance.post('/designs', formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateDesign: async (
    id: string,
    designData: UpdateDesignDto,
  ): Promise<apiResponse<Design>> => {
    dev.log(`🌐 Designs API: PUT /api/designs/${id}`, designData);
    const allowedFields = [
      "title", "description", "type", "clientId", "assignedTo",
      "dueDate", "tags", "basePrice", "status", "addTags", "removeTags"
    ];
    const cleanedData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (designData[key as keyof UpdateDesignDto] !== undefined) {
        cleanedData[key] = designData[key as keyof UpdateDesignDto];
      }
    }
    const response = await axiosInstance.put(`/designs/${id}`, cleanedData, {
      headers: { 'Content-Type': 'application/json' },
    });
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
    dev.log(`🌐 Designs API: PATCH /api/designs/${id}/status`);
    const response = await axiosInstance.patch(`/designs/${id}/status`, { status });
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
    images.forEach((file) => formData.append("images", file));
    const response = await axiosInstance.post(`/designs/${id}/files`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // ✅ Nouvelle méthode : supprimer une image d'un design
  removeDesignImage: async (designId: string, fileId: string): Promise<apiResponse<Design>> => {
    dev.log(`🌐 Designs API: DELETE /api/designs/${designId}/files/${fileId}`);
    const response = await axiosInstance.delete(`/designs/${designId}/files/${fileId}`);
    return response.data;
  },
};