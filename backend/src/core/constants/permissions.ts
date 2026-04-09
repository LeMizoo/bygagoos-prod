// backend/src/core/constants/permissions.ts

export const Permissions = {
  // Permissions existantes
  'users:read': ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  'users:create': ['SUPER_ADMIN', 'ADMIN'],
  'users:update': ['SUPER_ADMIN', 'ADMIN'],
  'users:delete': ['SUPER_ADMIN'],
  
  'clients:read': ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DESIGNER', 'STAFF'],
  'clients:create': ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  'clients:update': ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  'clients:delete': ['SUPER_ADMIN', 'ADMIN'],
  
  'designs:read': ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DESIGNER', 'STAFF', 'CLIENT'],
  'designs:create': ['SUPER_ADMIN', 'ADMIN', 'DESIGNER'],
  'designs:update': ['SUPER_ADMIN', 'ADMIN', 'DESIGNER'],
  'designs:delete': ['SUPER_ADMIN', 'ADMIN'],
  
  // Permissions pour les commandes
  'orders:read': ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DESIGNER', 'STAFF', 'CLIENT'],
  'orders:create': ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CLIENT'],
  'orders:update': ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DESIGNER'],
  'orders:delete': ['SUPER_ADMIN', 'ADMIN'],
  'orders:update-status': ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DESIGNER'],
  'orders:assign': ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  'orders:message': ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DESIGNER', 'CLIENT'],
  'orders:read-stats': ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  
  // Permissions dashboard
  'dashboard:read': ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
};