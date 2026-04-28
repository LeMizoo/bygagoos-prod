import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../api/axiosInstance';
import dev from '../utils/devLogger';

interface GalleryParams {
  page?: number;
  limit?: number;
}

export const useGallery = (params?: GalleryParams) => {
  return useQuery({
    queryKey: ['gallery', params],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/designs/public', {
          params: {
            page: params?.page || 1,
            limit: params?.limit || 12,
            sortBy: 'createdAt',
            sortOrder: 'desc',
          },
        });
        return response.data;
      } catch (error) {
        dev.error('Erreur useGallery:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};