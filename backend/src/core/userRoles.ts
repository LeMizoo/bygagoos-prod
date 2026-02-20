/**
 * Rôles utilisateur de l'application
 */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN', // Accès total
  ADMIN = 'ADMIN', // Gestion utilisateurs/staff
  MANAGER = 'MANAGER', // Gestion staff/clients
  DESIGNER = 'DESIGNER', // Gestion designs/clients
  STAFF = 'STAFF', // Consultation clients/designs
  CLIENT = 'CLIENT' // Accès limité à ses données
}

/**
 * Catégories de staff
 */
export enum StaffCategory {
  DESIGNER = 'DESIGNER',
  ACCOUNTANT = 'ACCOUNTANT',
  MANAGER = 'MANAGER',
  SALES = 'SALES',
  PRODUCTION = 'PRODUCTION'
}

/**
 * Rôles de staff
 */
export enum StaffRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SUPERVISOR = 'SUPERVISOR',
  STAFF = 'STAFF',
  TRAINEE = 'TRAINEE'
}

/**
 * Types de design
 */
export enum DesignType {
  LOGO = 'LOGO',
  BRANDING = 'BRANDING',
  PACKAGING = 'PACKAGING',
  PRINT = 'PRINT',
  DIGITAL = 'DIGITAL',
  ILLUSTRATION = 'ILLUSTRATION',
  OTHER = 'OTHER'
}

/**
 * Statuts de design
 */
export enum DesignStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED'
}

/**
 * Statuts de commande
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

/**
 * Statuts de paiement
 */
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED'
}

export default UserRole;