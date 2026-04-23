import { useQuery, useMutation } from '@tanstack/react-query';
import { designApi, DesignQuery, Design } from '../api/designApi';
import { useInvalidateQueries } from './useAutoInvalidate';

/**
 * Hook pour récupérer tous les designs
 */
export const useDesigns = (query?: DesignQuery) => {
  return useQuery({
    queryKey: ['designs', query],
    queryFn: () => designApi.getAll(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook pour récupérer un design par ID
 */
export const useDesign = (id: string) => {
  return useQuery({
    queryKey: ['design', id],
    queryFn: () => designApi.getById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
};

/**
 * Hook pour récupérer les designs pour la galerie publique
 */
export const useGallery = (query?: DesignQuery) => {
  return useQuery({
    queryKey: ['gallery', query],
    queryFn: () => designApi.getPublicGallery(query),
    staleTime: 10 * 60 * 1000, // 10 minutes (peut être plus long pour la galerie)
    gcTime: 15 * 60 * 1000,
  });
};

/**
 * Hook pour récupérer les designs par catégorie
 */
export const useDesignsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['designs', 'category', category],
    queryFn: () => designApi.getByCategory(category),
    staleTime: 5 * 60 * 1000,
    enabled: !!category,
  });
};

/**
 * Hook pour créer un design
 */
export const useCreateDesign = () => {
  const { invalidateDesigns } = useInvalidateQueries();

  return useMutation({
    mutationFn: (data: Partial<Design>) => designApi.create(data),
    onSuccess: () => {
      invalidateDesigns();
    },
  });
};

/**
 * Hook pour mettre à jour un design
 */
export const useUpdateDesign = () => {
  const { invalidateDesigns } = useInvalidateQueries();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Design> }) =>
      designApi.update(id, data),
    onSuccess: () => {
      invalidateDesigns();
    },
  });
};

/**
 * Hook pour supprimer un design
 */
export const useDeleteDesign = () => {
  const { invalidateDesigns } = useInvalidateQueries();

  return useMutation({
    mutationFn: (id: string) => designApi.delete(id),
    onSuccess: () => {
      invalidateDesigns();
    },
  });
};

/**
 * Hook pour récupérer les stats des designs
 */
export const useDesignStats = () => {
  return useQuery({
    queryKey: ['design', 'stats'],
    queryFn: () => designApi.getStats(),
    staleTime: 5 * 60 * 1000,
  });
};
