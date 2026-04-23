import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

/**
 * Hook pour invalider automatiquement les requêtes React Query
 * basée sur les événements du backend (via HTTP polling/SSE)
 */

export type QueryKey = readonly unknown[];

const invalidationRules: Record<string, QueryKey[]> = {
  'client:created': [['clients'], ['client', 'stats']],
  'client:updated': [['clients'], ['client', 'stats']],
  'client:deleted': [['clients'], ['client', 'stats']],
  
  'design:created': [['designs'], ['design', 'stats'], ['gallery']],
  'design:updated': [['designs'], ['design', 'stats'], ['gallery']],
  'design:deleted': [['designs'], ['design', 'stats'], ['gallery']],
  
  'order:created': [['orders'], ['order', 'stats'], ['clients'], ['dashboard']],
  'order:updated': [['orders'], ['order', 'stats'], ['dashboard']],
  'order:deleted': [['orders'], ['order', 'stats'], ['dashboard']],
  'order:status-changed': [['orders'], ['order', 'stats'], ['dashboard']],
  
  'staff:created': [['staff'], ['staff', 'stats']],
  'staff:updated': [['staff'], ['staff', 'stats']],
  'staff:deleted': [['staff'], ['staff', 'stats']],
  
  'user:created': [['users'], ['user', 'stats']],
  'user:updated': [['users'], ['user', 'stats']],
  'user:deleted': [['users'], ['user', 'stats']],
};

/**
 * Hook pour activer l'invalidation automatique des requêtes
 */
export const useAutoInvalidateQueries = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Cette fonction sera appelée par les événements du serveur
    const handleServerEvent = (eventType: string) => {
      const keysToInvalidate = invalidationRules[eventType];
      
      if (keysToInvalidate) {
        keysToInvalidate.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
    };

    // Exposer globalement pour que les autres modules puissent l'utiliser
    const globalWindow = window as Window & {
      invalidateQueriesOnEvent?: (eventType: string) => void;
    };
    globalWindow.invalidateQueriesOnEvent = handleServerEvent;

    return () => {
      delete globalWindow.invalidateQueriesOnEvent;
    };
  }, [queryClient]);
};

/**
 * Hook pour invalider manuellement des requêtes après mutations
 */
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  return {
    invalidate: (keys: QueryKey[]) => {
      keys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
    invalidateClients: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', 'stats'] });
    },
    invalidateDesigns: () => {
      queryClient.invalidateQueries({ queryKey: ['designs'] });
      queryClient.invalidateQueries({ queryKey: ['design', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
    invalidateOrders: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    invalidateStaff: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['staff', 'stats'] });
    },
    invalidateUsers: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'stats'] });
    },
  };
};
