// frontend/src/hooks/useDesigns.ts
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../api/axiosInstance';
import dev from '../utils/devLogger';

export interface Design {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  category?: string;
  type?: string;
  image?: string;
  thumbnail?: string;
  files?: Array<{ url: string }>;
  tags?: string[];
  price?: number;
  basePrice?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  status?: string;
  metadata?: {
    category?: string;
    basePrice?: number;
  };
}

interface GalleryParams {
  page?: number;
  limit?: number;
}

export const useGallery = (params?: GalleryParams) => {
  return useQuery({
    queryKey: ['gallery', params],
    queryFn: async (): Promise<Design[]> => {
      try {
        const response = await axiosInstance.get('/designs/public', {
          params: {
            page: params?.page || 1,
            limit: params?.limit || 12,
            sortBy: 'createdAt',
            sortOrder: 'desc',
          },
        });

        // Le backend renvoie { success, data: { designs, total, ... } }
        // On accepte aussi un tableau direct pour rester compatible avec d'anciens payloads.
        const payload = response.data?.data;
        const designsArray = Array.isArray(payload)
          ? payload
          : payload?.designs || [];

        console.log('📦 useGallery - designs extraits:', designsArray.length);
        return designsArray;
      } catch (error) {
        dev.error('Erreur useGallery:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};
