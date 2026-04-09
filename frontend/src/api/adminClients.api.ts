// frontend/src/api/adminClients.api.ts

import { Client as ClientType } from "../types/client";

// Réutiliser le type Client de types/client.ts
export type Client = ClientType;

export interface CreateClientData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  company?: string;
  notes?: string;
  isActive?: boolean;
  website?: string;
  siret?: string;
  vatNumber?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  tags?: string[];
  preferences?: {
    newsletter?: boolean;
    marketing?: boolean;
    language?: string;
    currency?: string;
  };
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

export interface UpdateClientData extends Partial<CreateClientData> {}

// Utiliser la même instance axios que le reste de l'app
import api from './client';
import { dev } from '../utils/devLogger';

// Fonction pour transformer les données de l'API vers le type Client
const transformClientData = (data: Record<string, unknown>): Client => {
  // Si le statut est "active"/"inactive" au lieu de isActive boolean
  let isActive = true;
  if (typeof data.isActive === 'boolean') {
    isActive = data.isActive;
  } else if (data.status === 'inactive') {
    isActive = false;
  } else if (data.status === 'pending') {
    isActive = false;
  }

  const name = typeof data.name === 'string' ? data.name : "";
  const nameParts = name.split(" ");
  const firstName = typeof data.firstName === 'string' ? data.firstName : nameParts[0] || "";
  const lastName = typeof data.lastName === 'string' ? data.lastName : (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");

  return {
    _id: typeof data._id === 'string' ? data._id : (typeof data.id === 'string' ? data.id : undefined),
    id: typeof data._id === 'string' ? data._id : (typeof data.id === 'string' ? data.id : undefined),
    firstName,
    lastName,
    email: typeof data.email === 'string' ? data.email : "",
    phone: typeof data.phone === 'string' ? data.phone : undefined,
    address: typeof data.address === 'string' ? data.address : undefined,
    city: typeof data.city === 'string' ? data.city : undefined,
    postalCode: typeof data.postalCode === 'string' ? data.postalCode : undefined,
    country: typeof data.country === 'string' ? data.country : undefined,
    company: typeof data.company === 'string' ? data.company : undefined,
    notes: typeof data.notes === 'string' ? data.notes : undefined,
    isActive,
    createdAt: (data.createdAt as string | Date) || undefined,
    updatedAt: (data.updatedAt as string | Date) || undefined,
    website: typeof data.website === 'string' ? data.website : undefined,
    siret: typeof data.siret === 'string' ? data.siret : undefined,
    vatNumber: typeof data.vatNumber === 'string' ? data.vatNumber : undefined,
    contactPerson: typeof data.contactPerson === 'string' ? data.contactPerson : undefined,
    contactPhone: typeof data.contactPhone === 'string' ? data.contactPhone : undefined,
    contactEmail: typeof data.contactEmail === 'string' ? data.contactEmail : undefined,
    tags: Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    preferences: data.preferences as Client['preferences'],
    billingAddress: data.billingAddress as Client['billingAddress'],
    shippingAddress: data.shippingAddress as Client['shippingAddress'],
    totalOrders: typeof data.totalOrders === 'number' ? data.totalOrders : 0,
    totalSpent: typeof data.totalSpent === 'number' ? data.totalSpent : 0,
    lastOrderDate: (data.lastOrderDate as string | Date) || undefined,
    averageOrderValue: typeof data.averageOrderValue === 'number' ? data.averageOrderValue : undefined,
  };
};

export const adminClientsApi = {
  // Récupérer tous les clients
  getAll: async (): Promise<Client[]> => {
    try {
      dev.log('🌐 Clients API: GET /api/clients');
      const response = await api.get('/clients');
      const data = response.data.data || response.data;
      return Array.isArray(data) ? data.map(transformClientData) : [];
    } catch (error) {
      dev.error("❌ Error fetching clients:", error);
      return [];
    }
  },
  
  getById: async (id: string): Promise<Client> => {
    dev.log(`🌐 Clients API: GET /api/clients/${id}`);
    const response = await api.get(`/clients/${id}`);
    const data = response.data.data || response.data;
    return transformClientData(data);
  },
  
  create: async (data: CreateClientData): Promise<Client> => {
    dev.log('🌐 Clients API: POST /api/clients');
    const response = await api.post('/clients', data);
    const responseData = response.data.data || response.data;
    return transformClientData(responseData);
  },
  
  update: async (id: string, data: UpdateClientData): Promise<Client> => {
    dev.log(`🌐 Clients API: PATCH /api/clients/${id}`);
    const response = await api.patch(`/clients/${id}`, data);
    const responseData = response.data.data || response.data;
    return transformClientData(responseData);
  },
  
  delete: async (id: string): Promise<void> => {
    dev.log(`🌐 Clients API: DELETE /api/clients/${id}`);
    await api.delete(`/clients/${id}`);
  },
  
  toggleStatus: async (id: string, isActive: boolean): Promise<Client> => {
    dev.log(`🌐 Clients API: PATCH /api/clients/${id}/status`);
    const response = await api.patch(`/clients/${id}/status`, { isActive });
    const responseData = response.data.data || response.data;
    return transformClientData(responseData);
  },
  
  // Alias pour compatibilité
  getAllClients: async (): Promise<Client[]> => adminClientsApi.getAll(),
  createClient: async (data: CreateClientData): Promise<Client> => adminClientsApi.create(data),
  updateClient: async (id: string, data: UpdateClientData): Promise<Client> => adminClientsApi.update(id, data),
  deleteClient: async (id: string): Promise<void> => adminClientsApi.delete(id),
  toggleClientStatus: async (id: string, isActive: boolean): Promise<Client> => adminClientsApi.toggleStatus(id, isActive),
};

export default adminClientsApi;