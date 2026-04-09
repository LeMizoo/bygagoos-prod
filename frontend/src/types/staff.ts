// frontend/src/types/staff.ts
export type StaffCategory = "FAMILY" | "PRODUCTION";

export type StaffRole =
  | "USER"
  | "PRODUCTION"
  | "FOUNDER"
  | "INSPIRATION"
  | "CREATION"
  | "ADMIN_INSPIRATION"
  | "ADMIN_PRODUCTION"
  | "ADMIN_COMMUNICATION"
  | "ARTISAN"
  | "SUPER_ADMIN"
  | "ADMIN"
  | "STAFF"
  | "MANAGER";

export interface Staff {
  _id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  category: StaffCategory;
  role: StaffRole;
  responsibilities: string[];
  active: boolean;
  isActive: boolean;
  joinedAt: string;
  department?: string;
  skills?: string[];
  avatar?: string;
  user?: {
    _id: string;
    email: string;
    role: string;
  };
  createdAt?: string;
  updatedAt?: string;
  name?: string;
  phone?: string;
  position?: string;
  description?: string;
  notes?: string;
  status?: "active" | "inactive";
}

// Interface API - ce que l'API retourne réellement
export interface ApiStaffMember {
  _id: string;
  name?: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  role: string;
  isActive?: boolean;
  avatar?: string;
  description?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  active?: boolean;
  category?: string;
  responsibilities?: string[];
  skills?: string[];
  user?: {
    _id: string;
    email: string;
    role: string;
  };
  joinedAt?: string;
}

// Fonction utilitaire pour valider et mapper le rôle
export const normalizeRole = (role: string | undefined): StaffRole => {
  const validRoles: StaffRole[] = [
    "USER",
    "PRODUCTION",
    "FOUNDER",
    "INSPIRATION",
    "CREATION",
    "ADMIN_INSPIRATION",
    "ADMIN_PRODUCTION",
    "ADMIN_COMMUNICATION",
    "ARTISAN",
    "SUPER_ADMIN",
    "ADMIN",
    "STAFF",
    "MANAGER",
  ];

  if (role && validRoles.includes(role as StaffRole)) {
    return role as StaffRole;
  }

  // Gestion des variantes de rôle
  if (role === "SUPER ADMIN" || role === "SUPERADMIN") {
    return "SUPER_ADMIN";
  }

  if (role === "MANAGER" || role === "GESTIONNAIRE") {
    return "MANAGER";
  }

  if (role && role.toUpperCase().includes("ADMIN")) {
    return "ADMIN";
  }

  if (
    role &&
    (role.toUpperCase().includes("STAFF") ||
      role.toUpperCase().includes("EMPLOYE"))
  ) {
    return "STAFF";
  }

  return "STAFF";
};

// Fonction utilitaire pour valider la catégorie
export const normalizeCategory = (
  category: string | undefined,
): StaffCategory => {
  if (category === "FAMILY" || category === "PRODUCTION") {
    return category;
  }
  return "PRODUCTION";
};

// Fonction utilitaire pour convertir ApiStaffMember en Staff
export const apiToStaff = (member: ApiStaffMember): Staff => {
  const nameParts = member.name ? member.name.split(" ") : [];
  const firstName = member.firstName || nameParts[0] || "";
  const lastName =
    member.lastName ||
    (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");

  return {
    _id: member._id,
    firstName,
    lastName,
    displayName:
      member.displayName || member.name || `${firstName} ${lastName}`.trim(),
    email: member.email,
    category: normalizeCategory(member.category),
    role: normalizeRole(member.role),
    responsibilities: member.responsibilities || [],
    active: member.isActive ?? member.active ?? true,
    isActive: member.isActive ?? member.active ?? true,
    joinedAt: member.joinedAt || member.createdAt || new Date().toISOString(),
    department: member.department || "",
    skills: member.skills || [],
    avatar: member.avatar,
    user: member.user,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
    name: member.name || `${firstName} ${lastName}`.trim(),
    phone: member.phone || "",
    position: member.position || "",
    description: member.description || "",
    notes: member.notes || "",
    status: (member.isActive ?? member.active ?? true) ? "active" : "inactive",
  };
};
export type StaffMember = Staff;