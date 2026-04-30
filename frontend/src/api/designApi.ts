import axiosInstance from './axiosInstance';

export interface Design {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  category?: string;
  image?: string;
  thumbnail?: string;
  files?: Array<{ name: string; url: string }>;
  tags?: string[];
  price?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DesignQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DesignResponse {
  success: boolean;
  data?: {
    designs: Design[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

/**
 * API client pour les designs
 */
export const designApi = {
  /**
   * Récupère tous les designs
   */
  async getAll(query?: DesignQuery): Promise<DesignResponse> {
    const params = {
      page: query?.page || 1,
      limit: query?.limit || 10,
      search: query?.search,
      category: query?.category,
      isActive: query?.isActive ?? true,
      sortBy: query?.sortBy || 'createdAt',
      sortOrder: query?.sortOrder || 'desc',
    };

    const response = await axiosInstance.get<DesignResponse>('/designs', { params });
    return response.data;
  },

  /**
   * Récupère un design par son ID
   */
  async getById(id: string): Promise<DesignResponse> {
    const response = await axiosInstance.get<DesignResponse>(`/designs/${id}`);
    return response.data;
  },

  /**
   * Crée un nouveau design
   */
  async create(data: Partial<Design>): Promise<DesignResponse> {
    const response = await axiosInstance.post<DesignResponse>('/designs', data);
    return response.data;
  },

  /**
   * Met à jour un design
   */
  async update(id: string, data: Partial<Design>): Promise<DesignResponse> {
    const response = await axiosInstance.put<DesignResponse>(`/designs/${id}`, data);
    return response.data;
  },

  /**
   * Supprime un design
   */
  async delete(id: string): Promise<DesignResponse> {
    const response = await axiosInstance.delete<DesignResponse>(`/designs/${id}`);
    return response.data;
  },

  /**
   * Récupère les designs par catégorie
   */
  async getByCategory(category: string): Promise<DesignResponse> {
    const response = await axiosInstance.get<DesignResponse>('/designs', {
      params: { category, isActive: true }
    });
    return response.data;
  },

  /**
   * Récupère les designs publics pour la galerie
   */
  async getPublicGallery(query?: DesignQuery): Promise<DesignResponse> {
    const params = {
      page: query?.page || 1,
      limit: query?.limit || 12,
      isActive: true,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    const response = await axiosInstance.get<DesignResponse>('/designs/public', { params });
    return response.data;
  },

  /**
   * Récupère les statistiques des designs
   */
  async getStats(): Promise<any> {
    const response = await axiosInstance.get('/designs/stats');
    return response.data;
  },
};