// frontend/src/api/adminDesigns.api.ts

import { axiosInstance } from './axiosInstance'; // ← utilise l'instance avec intercepteurs
import { dev } from '../utils/devLogger';
import type {
  Design,
  CreateDesignDto,
  UpdateDesignDto,
  DesignFilters,
  apiResponse,
  PaginatedResponse,
} from "../types";

// Ré-exporter Design pour les imports externes
export type { Design };

export const adminDesignsApi = {
  // Récupérer tous les designs avec pagination/filtres
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

  // Récupérer un design par ID
  getDesignById: async (id: string): Promise<apiResponse<Design>> => {
    dev.log(`🌐 Designs API: GET /api/designs/${id}`);
    const response = await axiosInstance.get(`/designs/${id}`);
    return response.data;
  },

  // Créer un nouveau design
  createDesign: async (
    designData: CreateDesignDto,
  ): Promise<apiResponse<Design>> => {
    dev.log('🌐 Designs API: POST /api/designs');
    const formData = new FormData();

    // Ajouter les champs texte
    const textFields = [
      "title",
      "description",
      "category",
      "style",
      "printType",
      "printArea",
      "notes",
    ];
    textFields.forEach((field) => {
      const value = (designData as any)[field];
      if (value !== undefined && value !== null && value !== "") {
        formData.append(field, String(value));
      }
    });

    if (designData.status) {
      formData.append("status", designData.status);
    }

    if (designData.basePrice !== undefined) {
      formData.append("basePrice", designData.basePrice.toString());
    }
    if (designData.minQuantity !== undefined) {
      formData.append("minQuantity", designData.minQuantity.toString());
    }
    if (designData.productionTime !== undefined) {
      formData.append("productionTime", designData.productionTime.toString());
    }

    if (designData.colors && designData.colors.length > 0) {
      formData.append("colors", JSON.stringify(designData.colors));
    }
    if (designData.sizes && designData.sizes.length > 0) {
      formData.append("sizes", JSON.stringify(designData.sizes));
    }
    if (designData.tags && designData.tags.length > 0) {
      formData.append("tags", JSON.stringify(designData.tags));
    }

    if (designData.images && designData.images.length > 0) {
      designData.images.forEach((file, index) => {
        formData.append("images", file);
        if (index === 0) {
          formData.append("thumbnailIndex", "0");
        }
      });
    }

    const response = await axiosInstance.post('/designs', formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Mettre à jour un design
  updateDesign: async (
    id: string,
    designData: UpdateDesignDto,
  ): Promise<apiResponse<Design>> => {
    dev.log(`🌐 Designs API: PUT /api/designs/${id}`);
    const formData = new FormData();

    const textFields = [
      "title",
      "description",
      "category",
      "style",
      "printType",
      "printArea",
      "notes",
    ];
    textFields.forEach((field) => {
      const value = (designData as any)[field];
      if (value !== undefined && value !== null && value !== "") {
        formData.append(field, String(value));
      }
    });

    if (designData.status) {
      formData.append("status", designData.status);
    }

    if (designData.basePrice !== undefined) {
      formData.append("basePrice", designData.basePrice.toString());
    }
    if (designData.minQuantity !== undefined) {
      formData.append("minQuantity", designData.minQuantity.toString());
    }
    if (designData.productionTime !== undefined) {
      formData.append("productionTime", designData.productionTime.toString());
    }
    if (designData.popularity !== undefined) {
      formData.append("popularity", designData.popularity.toString());
    }

    if (designData.colors && designData.colors.length > 0) {
      formData.append("colors", JSON.stringify(designData.colors));
    }
    if (designData.sizes && designData.sizes.length > 0) {
      formData.append("sizes", JSON.stringify(designData.sizes));
    }
    if (designData.tags && designData.tags.length > 0) {
      formData.append("tags", JSON.stringify(designData.tags));
    }

    if (designData.images) {
      designData.images.forEach((file) => {
        formData.append("images", file);
      });
    }

    const response = await axiosInstance.put(`/designs/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Supprimer un design
  deleteDesign: async (id: string): Promise<apiResponse<void>> => {
    dev.log(`🌐 Designs API: DELETE /api/designs/${id}`);
    const response = await axiosInstance.delete(`/designs/${id}`);
    return response.data;
  },

  // Mettre à jour le statut
  updateDesignStatus: async (
    id: string,
    status: "active" | "inactive" | "archived",
  ): Promise<apiResponse<Design>> => {
    dev.log(`🌐 Designs API: PATCH /api/designs/${id}/status`);
    const response = await axiosInstance.patch(`/designs/${id}/status`, { status });
    return response.data;
  },

  // Récupérer les statistiques
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

  // Upload d'images supplémentaires
  uploadDesignImages: async (
    id: string,
    images: File[],
  ): Promise<apiResponse<Design>> => {
    dev.log(`🌐 Designs API: POST /api/designs/${id}/images`);
    const formData = new FormData();
    images.forEach((file) => formData.append("images", file));

    const response = await axiosInstance.post(`/designs/${id}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};