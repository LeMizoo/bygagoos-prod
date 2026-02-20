import { IClient } from '../client.model';

export class ClientResponseDTO {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  } | null;
  avatar?: string | null;
  notes?: string | null;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(client: any) {
    this.id = client._id?.toString() || client.id;
    this.firstName = client.firstName;
    this.lastName = client.lastName;
    this.fullName = `${client.firstName} ${client.lastName}`.trim();
    this.email = client.email;
    this.phone = client.phone;
    this.company = client.company;
    this.address = client.address;
    this.avatar = client.avatar;
    this.notes = client.notes;
    this.tags = client.tags || [];
    this.isActive = client.isActive;
    this.createdAt = client.createdAt;
    this.updatedAt = client.updatedAt;
  }
}