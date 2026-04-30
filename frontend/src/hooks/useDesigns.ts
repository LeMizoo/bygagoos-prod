import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../api/axiosInstance';
import dev from '../utils/devLogger';

// Interface complète pour un design (à utiliser dans GalleryPage)
export interface Design {
  _id: string;
  id?: string | number;
  title: string;
  name?: string;
  description?: string;
  category: string;
  collection?: string;
  image: string;
  thumbnail?: string;
  tags?: string[];
  price?: number;
  isActive?: boolean;
  createdAt?: string;
  likes: number;
  artist: string;
  featured?: boolean;
  new?: boolean;
  ethnicGroup?: string;
  colors?: string[];
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: {
    designs?: Design[];
    data?: Design[];
  };
}

export const useGallery = () => {
  return useQuery({
    queryKey: ['gallery'],
    queryFn: async (): Promise<Design[]> => {
      try {
        const response = await axiosInstance.get<ApiResponse>('/designs/public');
        // Extraction robuste des designs
        let designs: Design[] = [];
        if (response.data?.data?.designs) {
          designs = response.data.data.designs;
        } else if (response.data?.data?.data) {
          designs = response.data.data.data;
        } else if (Array.isArray(response.data)) {
          designs = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          designs = response.data.data;
        }
        
        // Normalisation des designs
        return designs.map((d: Partial<Design>) => ({
          _id: d._id || '',
          id: d.id || d._id || '',
          title: d.title || '',
          name: d.name || d.title || '',
          description: d.description,
          category: d.category || 'Non catégorisé',
          collection: d.collection,
          image: (d.thumbnail || d.image || '').replace(/^http:/, 'https:') || '/images/placeholder-tshirt.png',
          thumbnail: d.thumbnail,
          tags: d.tags || [],
          price: d.price,
          isActive: d.isActive,
          createdAt: d.createdAt,
          likes: d.likes ?? 0,
          artist: d.artist || 'ByGagoos Ink',
          featured: d.featured ?? false,
          new: d.new ?? false,
          ethnicGroup: d.ethnicGroup,
          colors: d.colors || [],
        }));
      } catch (error) {
        dev.error('Erreur useGallery:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};