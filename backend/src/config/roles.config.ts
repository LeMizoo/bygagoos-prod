// backend/src/config/roles.config.ts

// Import the UserRole enum
import { UserRole } from '../core/userRoles';

// Mapping des rôles utilisateur vers les rôles staff
export const USER_ROLE_TO_STAFF_ROLE = {
  'super-admin': 'SUPER_ADMIN',
  'admin-inspiration': 'ADMIN_INSPIRATION',
  'admin-production': 'ADMIN_PRODUCTION',
  'admin-communication': 'ADMIN_COMMUNICATION'
} as const;

// Rôles autorisés à gérer le staff
export const STAFF_MANAGEMENT_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  'ADMIN_INSPIRATION',
  'ADMIN_PRODUCTION',
  'ADMIN_COMMUNICATION'
] as const;

// Rôles utilisateur correspondants (pour le frontend)
export const USER_STAFF_MANAGEMENT_ROLES = [
  'super-admin',
  'admin-inspiration',
  'admin-production',
  'admin-communication'
] as const;

// Type pour les rôles autorisés
export type StaffManagementRole = typeof STAFF_MANAGEMENT_ROLES[number];
export type UserStaffManagementRole = typeof USER_STAFF_MANAGEMENT_ROLES[number];