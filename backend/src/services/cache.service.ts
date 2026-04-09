// Simulation d'un service de cache (à adapter selon votre implémentation Redis/Node-Cache)
export const cache = {
  get: async (key: string): Promise<any> => {
    return null; // Implémentez la logique de récupération
  },
  set: async (key: string, value: any, ttl?: number): Promise<void> => {
    // Implémentez la logique de stockage
  },
  del: async (key: string): Promise<void> => {
    // Implémentez la suppression
  },
  delByPattern: async (pattern: string): Promise<void> => {
    // Implémentez la suppression par pattern (ex: Redis SCAN/DEL)
    console.log(`Cache cleared for pattern: ${pattern}`);
  }
};