// frontend/src/types/client.ts

export interface Client {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  isActive: boolean;
  notes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  avatar?: string;
  
  // Champs optionnels supplémentaires
  website?: string;
  siret?: string;
  vatNumber?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  tags?: string[];
  
  // Statistiques (peuvent être calculées côté serveur)
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string | Date;
  averageOrderValue?: number;
  
  // Préférences
  preferences?: {
    newsletter?: boolean;
    marketing?: boolean;
    language?: string;
    currency?: string;
  };
  
  // Adresse de livraison/facturation supplémentaires
  billingAddress?: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  shippingAddress?: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export interface ClientFilters {
  searchTerm?: string;
  city?: string;
  isActive?: boolean;
  hasCompany?: boolean;
  tags?: string[];
  createdFrom?: string;
  createdTo?: string;
  minSpent?: number;
  maxSpent?: number;
  page?: number;
  limit?: number;
  sortBy?: keyof Client;
  sortOrder?: 'asc' | 'desc';
}

export interface ClientStats {
  total: number;
  active: number;
  inactive: number;
  withCompany: number;
  withoutCompany: number;
  topCities: Array<{ city: string; count: number }>;
  recentClients: Client[];
  withPhone: number;
  withEmail: number;
  totalSpent: number;
  averageSpent: number;
}