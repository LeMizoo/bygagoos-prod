/**
 * Rôles utilisateur pour ByGagoos-Ink
 * Basé sur l'architecture de l'équipe fondatrice
 */

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  DESIGNER = 'DESIGNER',
  STAFF = 'STAFF',
  CLIENT = 'CLIENT'
}

// ✅ AJOUT: Mapping des rôles spécifiques ByGagoos vers l'enum principal
export const ByGagoosRoleMapping = {
  'super-admin': UserRole.SUPER_ADMIN,
  'admin-inspiration': UserRole.ADMIN,
  'admin-production': UserRole.ADMIN,
  'admin-communication': UserRole.ADMIN,
  'manager': UserRole.MANAGER,
  'designer': UserRole.DESIGNER,
  'staff': UserRole.STAFF,
  'client': UserRole.CLIENT,
  'user': UserRole.CLIENT
} as const;

export type ByGagoosSpecificRole = keyof typeof ByGagoosRoleMapping;

// ✅ AJOUT: Tous les rôles valides (pour validation MongoDB)
export const ALL_VALID_ROLES = [
  ...Object.values(UserRole),
  ...Object.keys(ByGagoosRoleMapping)
] as const;

export type ValidRole = typeof ALL_VALID_ROLES[number];

// Hiérarchie des rôles (plus le nombre est élevé, plus le rôle est élevé)
export const RoleHierarchy = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.ADMIN]: 80,
  [UserRole.MANAGER]: 60,
  [UserRole.DESIGNER]: 40,
  [UserRole.STAFF]: 20,
  [UserRole.CLIENT]: 10
} as const;

// Interface pour les rôles avec permissions
export interface IUserRole {
  role: UserRole;
  permissions: string[];
}

// ✅ AJOUT: Interface pour les rôles spécifiques ByGagoos
export interface IByGagoosUserRole {
  originalRole: ByGagoosSpecificRole;
  mappedRole: UserRole;
  permissions: string[];
}

// Permissions par rôle
export const RolePermissions: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: ['*'], // Toutes les permissions
  
  [UserRole.ADMIN]: [
    'users:read', 
    'users:write', 
    'staff:read', 
    'staff:write', 
    'clients:read', 
    'clients:write',
    'designs:read',
    'designs:write',
    'orders:read',
    'orders:write',
    'dashboard:read'
  ],
  
  [UserRole.MANAGER]: [
    'staff:read', 
    'staff:write', 
    'clients:read', 
    'clients:write',
    'designs:read',
    'orders:read',
    'dashboard:read'
  ],
  
  [UserRole.DESIGNER]: [
    'designs:read', 
    'designs:write', 
    'clients:read',
    'orders:read'
  ],
  
  [UserRole.STAFF]: [
    'clients:read', 
    'designs:read',
    'orders:read'
  ],
  
  [UserRole.CLIENT]: [
    'own:read', 
    'own:write',
    'orders:own'
  ]
};

// ✅ AJOUT: Fonction utilitaire pour normaliser un rôle
export function normalizeRole(role: string): UserRole {
  // Si c'est déjà un UserRole valide
  if (Object.values(UserRole).includes(role as UserRole)) {
    return role as UserRole;
  }
  
  // Si c'est un rôle spécifique ByGagoos
  if (role in ByGagoosRoleMapping) {
    return ByGagoosRoleMapping[role as ByGagoosSpecificRole];
  }
  
  // Par défaut, retourner CLIENT
  console.warn(`⚠️ Rôle inconnu "${role}", utilisation de CLIENT par défaut`);
  return UserRole.CLIENT;
}

// ✅ AJOUT: Vérifier si un rôle a une permission spécifique
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = RolePermissions[role];
  
  // SUPER_ADMIN a toutes les permissions
  if (role === UserRole.SUPER_ADMIN && permission !== '*') {
    return true;
  }
  
  return permissions.includes('*') || permissions.includes(permission);
}

// ✅ AJOUT: Vérifier si un rôle est supérieur ou égal à un autre
export function isRoleAtLeast(userRole: UserRole, requiredRole: UserRole): boolean {
  const userLevel = RoleHierarchy[userRole] || 0;
  const requiredLevel = RoleHierarchy[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
}

// ✅ AJOUT: Obtenir tous les rôles inférieurs
export function getLowerRoles(role: UserRole): UserRole[] {
  const currentLevel = RoleHierarchy[role];
  
  return Object.entries(RoleHierarchy)
    .filter(([_, level]) => level < currentLevel)
    .map(([roleName]) => roleName as UserRole);
}

// ✅ AJOUT: Obtenir tous les rôles supérieurs
export function getHigherRoles(role: UserRole): UserRole[] {
  const currentLevel = RoleHierarchy[role];
  
  return Object.entries(RoleHierarchy)
    .filter(([_, level]) => level > currentLevel)
    .map(([roleName]) => roleName as UserRole);
}

// Description des rôles pour l'affichage
export const RoleDescriptions: Record<UserRole, { name: string; description: string }> = {
  [UserRole.SUPER_ADMIN]: {
    name: 'Super Admin',
    description: 'Accès total à toutes les fonctionnalités et paramètres'
  },
  [UserRole.ADMIN]: {
    name: 'Administrateur',
    description: 'Gestion des utilisateurs, staff, clients et designs'
  },
  [UserRole.MANAGER]: {
    name: 'Manager',
    description: 'Gestion du staff et des clients'
  },
  [UserRole.DESIGNER]: {
    name: 'Designer',
    description: 'Création et modification des designs'
  },
  [UserRole.STAFF]: {
    name: 'Staff',
    description: 'Consultation des clients et designs'
  },
  [UserRole.CLIENT]: {
    name: 'Client',
    description: 'Gestion de son propre profil et commandes'
  }
};

// Mapping des rôles ByGagoos vers les descriptions
export const ByGagoosRoleDescriptions: Record<ByGagoosSpecificRole, { name: string; description: string; team: string }> = {
  'super-admin': {
    name: 'Super Admin & Fondateur',
    description: 'Vision stratégique, développement d\'entreprise et direction générale',
    team: 'Direction'
  },
  'admin-inspiration': {
    name: 'Admin Inspiration',
    description: 'Direction artistique, créativité et recherche de nouvelles tendances',
    team: 'Création'
  },
  'admin-production': {
    name: 'Admin Production',
    description: 'Gestion de l\'atelier, contrôle qualité et optimisation des processus',
    team: 'Production'
  },
  'admin-communication': {
    name: 'Admin Communication',
    description: 'Relations clients, communication et développement commercial',
    team: 'Communication'
  },
  'manager': {
    name: 'Manager',
    description: 'Gestion d\'équipe et coordination',
    team: 'Management'
  },
  'designer': {
    name: 'Designer',
    description: 'Création graphique et conception',
    team: 'Création'
  },
  'staff': {
    name: 'Staff',
    description: 'Équipe de production',
    team: 'Production'
  },
  'client': {
    name: 'Client',
    description: 'Client ByGagoos-Ink',
    team: 'Clients'
  },
  'user': {
    name: 'Utilisateur',
    description: 'Utilisateur standard',
    team: 'Clients'
  }
};

// Export par défaut pour faciliter l'import
export default {
  UserRole,
  RoleHierarchy,
  RolePermissions,
  normalizeRole,
  hasPermission,
  isRoleAtLeast,
  getLowerRoles,
  getHigherRoles,
  RoleDescriptions,
  ByGagoosRoleDescriptions,
  ByGagoosRoleMapping,
  ALL_VALID_ROLES
};