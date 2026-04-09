// frontend/src/types/roles.ts

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  DESIGNER = 'DESIGNER',
  STAFF = 'STAFF',
  CLIENT = 'CLIENT'
}

// Permissions par rôle
export const rolePermissions: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: [
    'read:all',
    'write:all',
    'delete:all',
    'manage:users',
    'manage:roles',
    'read:revenue',
    'export:data',
    'manage:settings',
    // Staff permissions
    'read:staff',
    'write:staff',
    'delete:staff',
    'create:staff',
    'update:staff',
    'manage:staff',
    // Clients permissions
    'read:clients',
    'write:clients',
    'delete:clients',
    'create:clients',
    'update:clients',
    'manage:clients',
    // Designs permissions
    'read:designs',
    'write:designs',
    'delete:designs',
    'create:designs',
    'update:designs',
    'manage:designs',
    // Orders permissions
    'read:orders',
    'write:orders',
    'delete:orders',
    'create:orders',
    'update:orders',
    'manage:orders',
    // Dashboard permissions
    'read:dashboard',
    'read:analytics',
    // Settings permissions
    'read:settings',
    'write:settings'
  ],
  
  [UserRole.ADMIN]: [
    'read:all',
    'write:all',
    'delete:all',
    'manage:users',
    'read:revenue',
    'export:data',
    // Staff permissions
    'read:staff',
    'write:staff',
    'delete:staff',
    'create:staff',
    'update:staff',
    'manage:staff',
    // Clients permissions
    'read:clients',
    'write:clients',
    'delete:clients',
    'create:clients',
    'update:clients',
    'manage:clients',
    // Designs permissions
    'read:designs',
    'write:designs',
    'delete:designs',
    'create:designs',
    'update:designs',
    'manage:designs',
    // Orders permissions
    'read:orders',
    'write:orders',
    'delete:orders',
    'create:orders',
    'update:orders',
    'manage:orders',
    // Dashboard permissions
    'read:dashboard',
    'read:analytics'
  ],
  
  [UserRole.MANAGER]: [
    'read:staff',
    'read:clients',
    'read:orders',
    'write:orders',
    'update:orders',
    'create:orders',
    'read:designs',
    'read:revenue',
    'read:dashboard',
    // Limited staff management
    'read:staff',
    // Limited client management
    'read:clients'
  ],
  
  [UserRole.DESIGNER]: [
    'read:designs',
    'write:designs',
    'delete:own:designs',
    'create:designs',
    'update:designs',
    'read:designs',
    // Can view orders related to their designs
    'read:assigned:orders'
  ],
  
  [UserRole.STAFF]: [
    'read:assigned:orders',
    'write:assigned:orders',
    'update:assigned:orders',
    'read:assigned:clients',
    'read:assigned:designs'
  ],
  
  [UserRole.CLIENT]: [
    'read:own:orders',
    'write:own:orders',
    'create:own:orders',
    'update:own:orders',
    'read:designs',
    'read:public:designs'
  ]
};

// Vérifie si un rôle a une permission spécifique
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = rolePermissions[role];
  return permissions?.includes(permission) || false;
}

// Vérifie si un rôle a accès à une ressource spécifique
export function canAccess(role: UserRole, resource: string, action: 'read' | 'write' | 'delete' = 'read'): boolean {
  const permission = `${action}:${resource}`;
  return hasPermission(role, permission) || hasPermission(role, `${action}:all`);
}

// Vérifie si un rôle est admin (SUPER_ADMIN ou ADMIN)
export function isAdmin(role: UserRole): boolean {
  return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
}

// Vérifie si un rôle a des droits d'édition sur une ressource
export function canEdit(role: UserRole, resource: string): boolean {
  return hasPermission(role, `write:${resource}`) || 
         hasPermission(role, 'write:all') || 
         hasPermission(role, `manage:${resource}`);
}

// Vérifie si un rôle a des droits de suppression sur une ressource
export function canDelete(role: UserRole, resource: string): boolean {
  return hasPermission(role, `delete:${resource}`) || 
         hasPermission(role, 'delete:all') || 
         hasPermission(role, `manage:${resource}`);
}

// Vérifie si un rôle a des droits de création sur une ressource
export function canCreate(role: UserRole, resource: string): boolean {
  return hasPermission(role, `create:${resource}`) || 
         hasPermission(role, 'write:all') || 
         hasPermission(role, `manage:${resource}`);
}

// Vérifie si un rôle a des droits de lecture sur une ressource
export function canRead(role: UserRole, resource: string): boolean {
  return hasPermission(role, `read:${resource}`) || 
         hasPermission(role, 'read:all') || 
         hasPermission(role, `manage:${resource}`);
}

// Obtient toutes les permissions d'un rôle
export function getPermissions(role: UserRole): string[] {
  return rolePermissions[role] || [];
}

// Vérifie si un rôle a accès à une page spécifique
export function canAccessPage(role: UserRole, page: string): boolean {
  const pagePermissions: Record<string, string[]> = {
    'dashboard': ['read:dashboard', 'read:all', 'read:analytics'],
    'staff': ['read:staff', 'read:all', 'manage:staff'],
    'clients': ['read:clients', 'read:all', 'manage:clients'],
    'designs': ['read:designs', 'read:all', 'manage:designs'],
    'orders': ['read:orders', 'read:all', 'manage:orders'],
    'settings': ['read:settings', 'read:all', 'manage:settings'],
    'reports': ['read:analytics', 'read:all', 'read:revenue'],
  };

  const requiredPermissions = pagePermissions[page] || [];
  return requiredPermissions.some(permission => hasPermission(role, permission));
}