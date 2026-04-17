// frontend/src/api/adminClients.api.ts

import api from './client';
import { dev } from '../utils/devLogger';
import { Client as ClientType } from "../types/client";

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

const transformClientData = (data: Record<string, unknown>): Client => {
  let isActive = true;
  if (typeof data.isActive === 'boolean') {
    isActive = data.isActive;
  } else if (data.status === 'inactive' || data.status === 'pending') {
    isActive = false;
  }

  const name = typeof data.name === 'string' ? data.name : '';
  const nameParts = name.split(' ');
  const firstName = typeof data.firstName === 'string' ? data.firstName : nameParts[0] || '';
  const lastName = typeof data.lastName === 'string' ? data.lastName : (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');

  return {
    _id: typeof data._id === 'string' ? data._id : (typeof data.id === 'string' ? data.id : undefined),
    id: typeof data._id === 'string' ? data._id : (typeof data.id === 'string' ? data.id : undefined),
    firstName,
    lastName,
    email: typeof data.email === 'string' ? data.email : '',
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

const extractClientsList = (payload: unknown): Record<string, unknown>[] => {
  if (Array.isArray(payload)) {
    return payload as Record<string, unknown>[];
  }

  if (payload && typeof payload === 'object') {
    const maybeClients = (payload as { clients?: unknown }).clients;
    if (Array.isArray(maybeClients)) {
      return maybeClients as Record<string, unknown>[];
    }
  }

  return [];
};

const extractResponseData = (responseData: unknown): unknown => {
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return (responseData as { data?: unknown }).data ?? responseData;
  }

  return responseData;
};

const extractErrorMessage = (error: unknown, fallback: string): string => {
  const maybeError = error as { response?: { data?: { message?: unknown; error?: unknown } }; message?: unknown };
  const responseMessage = maybeError.response?.data?.message ?? maybeError.response?.data?.error;

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage;
  }

  if (typeof maybeError.message === 'string' && maybeError.message.trim()) {
    return maybeError.message;
  }

  return fallback;
};

export const adminClientsApi = {
  getAll: async (): Promise<Client[]> => {
    try {
      dev.log('?? Clients API: GET /api/clients');
      const response = await api.get('/clients');
      const payload = response.data?.data ?? response.data;
      return extractClientsList(payload).map(transformClientData);
    } catch (error) {
      dev.error('? Error fetching clients:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<Client> => {
    dev.log(`?? Clients API: GET /api/clients/${id}`);
    const response = await api.get(`/clients/${id}`);
    const data = extractResponseData(response.data);
    return transformClientData(data as Record<string, unknown>);
  },

  create: async (data: CreateClientData): Promise<Client> => {
    dev.log('?? Clients API: POST /api/clients');
    try {
      const response = await api.post('/clients', data);
      const responseData = extractResponseData(response.data);
      return transformClientData(responseData as Record<string, unknown>);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Erreur lors de la cr?ation du client'));
    }
  },

  update: async (id: string, data: UpdateClientData): Promise<Client> => {
    dev.log(`?? Clients API: PATCH /api/clients/${id}`);
    try {
      const response = await api.patch(`/clients/${id}`, data);
      const responseData = extractResponseData(response.data);
      return transformClientData(responseData as Record<string, unknown>);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Erreur lors de la mise ? jour du client'));
    }
  },

  delete: async (id: string): Promise<void> => {
    dev.log(`?? Clients API: DELETE /api/clients/${id}`);
    try {
      await api.delete(`/clients/${id}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Erreur lors de la suppression du client'));
    }
  },

  toggleStatus: async (id: string, isActive: boolean): Promise<Client> => {
    dev.log(`?? Clients API: PATCH /api/clients/${id}/status`);
    try {
      const response = await api.patch(`/clients/${id}/status`, { isActive });
      const responseData = extractResponseData(response.data);
      return transformClientData(responseData as Record<string, unknown>);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Erreur lors du changement de statut du client'));
    }
  },

  getAllClients: async (): Promise<Client[]> => adminClientsApi.getAll(),
  createClient: async (data: CreateClientData): Promise<Client> => adminClientsApi.create(data),
  updateClient: async (id: string, data: UpdateClientData): Promise<Client> => adminClientsApi.update(id, data),
  deleteClient: async (id: string): Promise<void> => adminClientsApi.delete(id),
  toggleClientStatus: async (id: string, isActive: boolean): Promise<Client> => adminClientsApi.toggleStatus(id, isActive),
};

export default adminClientsApi;
