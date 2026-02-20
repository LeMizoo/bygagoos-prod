// frontend/src/types/client.ts
export type ClientStatus = "active" | "inactive" | "pending";

export interface Client {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  taxId?: string; // Numéro d'identification fiscale
  notes?: string;
  status: ClientStatus;
  tags?: string[];
  preferredContactMethod?: "email" | "phone" | "whatsapp";
  lastOrderDate?: string;
  totalOrders?: number;
  totalSpent?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface CreateClientDto {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  taxId?: string;
  notes?: string;
  tags?: string[];
  preferredContactMethod?: "email" | "phone" | "whatsapp";
  status?: ClientStatus;
}

export interface UpdateClientDto extends Partial<CreateClientDto> {
  status?: ClientStatus;
}

// Interface pour la réponse de l'API
export interface ApiClient {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  taxId?: string;
  notes?: string;
  status: string;
  tags?: string[];
  preferredContactMethod?: string;
  lastOrderDate?: string;
  totalOrders?: number;
  totalSpent?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// Fonction utilitaire pour convertir ApiClient en Client
export const apiToClient = (apiData: ApiClient): Client => ({
  _id: apiData._id,
  name: apiData.name,
  email: apiData.email,
  phone: apiData.phone,
  company: apiData.company,
  address: apiData.address,
  taxId: apiData.taxId,
  notes: apiData.notes,
  status: apiData.status as ClientStatus,
  tags: apiData.tags || [],
  preferredContactMethod: apiData.preferredContactMethod as
    | "email"
    | "phone"
    | "whatsapp"
    | undefined,
  lastOrderDate: apiData.lastOrderDate,
  totalOrders: apiData.totalOrders || 0,
  totalSpent: apiData.totalSpent || 0,
  createdAt: apiData.createdAt,
  updatedAt: apiData.updatedAt,
  createdBy: apiData.createdBy,
});

// Interface pour les statistiques clients
export interface ClientStats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
  totalRevenue: number;
  averageOrderValue: number;
}

// Interface pour les filtres clients
export interface ClientFilters {
  search?: string;
  status?: ClientStatus;
  tags?: string[];
  minOrders?: number;
  maxOrders?: number;
  dateFrom?: string;
  dateTo?: string;
}
