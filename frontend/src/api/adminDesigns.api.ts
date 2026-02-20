// frontend/src/api/adminDesigns.api.ts
import axiosInstance from "./axiosInstance";
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

const API_BASE = "/admin/designs"; // ← ENLEVÉ /api

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
    const response = await axiosInstance.get<PaginatedResponse<Design>>(
      API_BASE,
      { params },
    );
    return response.data;
  },

  // Récupérer un design par ID
  getDesignById: async (id: string): Promise<apiResponse<Design>> => {
    const response = await axiosInstance.get<apiResponse<Design>>(
      `${API_BASE}/${id}`,
    );
    return response.data;
  },

  // Créer un nouveau design
  createDesign: async (
    designData: CreateDesignDto,
  ): Promise<apiResponse<Design>> => {
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

    // Ajouter le statut si fourni (maintenant présent dans le DTO)
    if (designData.status) {
      formData.append("status", designData.status);
    }

    // Ajouter les champs numériques
    if (designData.basePrice !== undefined) {
      formData.append("basePrice", designData.basePrice.toString());
    }
    if (designData.minQuantity !== undefined) {
      formData.append("minQuantity", designData.minQuantity.toString());
    }
    if (designData.productionTime !== undefined) {
      formData.append("productionTime", designData.productionTime.toString());
    }

    // Ajouter les tableaux
    if (designData.colors && designData.colors.length > 0) {
      formData.append("colors", JSON.stringify(designData.colors));
    }
    if (designData.sizes && designData.sizes.length > 0) {
      formData.append("sizes", JSON.stringify(designData.sizes));
    }
    if (designData.tags && designData.tags.length > 0) {
      formData.append("tags", JSON.stringify(designData.tags));
    }

    // Ajouter les images
    if (designData.images && designData.images.length > 0) {
      designData.images.forEach((file, index) => {
        formData.append("images", file);
        if (index === 0) {
          formData.append("thumbnailIndex", "0");
        }
      });
    }

    const response = await axiosInstance.post<apiResponse<Design>>(
      API_BASE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  // Mettre à jour un design
  updateDesign: async (
    id: string,
    designData: UpdateDesignDto,
  ): Promise<apiResponse<Design>> => {
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

    // Ajouter le statut si fourni (maintenant présent dans le DTO)
    if (designData.status) {
      formData.append("status", designData.status);
    }

    // Ajouter les champs numériques
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

    // Ajouter les tableaux
    if (designData.colors && designData.colors.length > 0) {
      formData.append("colors", JSON.stringify(designData.colors));
    }
    if (designData.sizes && designData.sizes.length > 0) {
      formData.append("sizes", JSON.stringify(designData.sizes));
    }
    if (designData.tags && designData.tags.length > 0) {
      formData.append("tags", JSON.stringify(designData.tags));
    }

    // Ajouter les nouvelles images
    if (designData.images) {
      designData.images.forEach((file) => {
        formData.append("images", file);
      });
    }

    const response = await axiosInstance.put<apiResponse<Design>>(
      `${API_BASE}/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  // Supprimer un design
  deleteDesign: async (id: string): Promise<apiResponse<void>> => {
    const response = await axiosInstance.delete<apiResponse<void>>(
      `${API_BASE}/${id}`,
    );
    return response.data;
  },

  // Mettre à jour le statut d'un design
  updateDesignStatus: async (
    id: string,
    status: "active" | "inactive" | "archived",
  ): Promise<apiResponse<Design>> => {
    const response = await axiosInstance.patch<apiResponse<Design>>(
      `${API_BASE}/${id}/status`,
      { status },
    );
    return response.data;
  },

  // Récupérer les statistiques des designs
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
    const response = await axiosInstance.get<apiResponse<any>>(
      `${API_BASE}/stats`,
    );
    return response.data;
  },

  // Upload d'images supplémentaires
  uploadDesignImages: async (
    id: string,
    images: File[],
  ): Promise<apiResponse<Design>> => {
    const formData = new FormData();
    images.forEach((file) => formData.append("images", file));

    const response = await axiosInstance.post<apiResponse<Design>>(
      `${API_BASE}/${id}/images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },
};
