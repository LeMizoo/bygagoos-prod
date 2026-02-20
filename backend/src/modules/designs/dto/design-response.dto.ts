import { IDesign, IDesignFile, DesignStatus, DesignType } from '../design.model';

export class DesignResponseDTO {
  id: string;
  title: string;
  description?: string | null;
  type: DesignType;
  status: DesignStatus;
  files: IDesignFile[];
  thumbnail?: string;
  tags: string[];
  isActive: boolean;
  client?: {
    id: string;
    name: string;
    email: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  assignedTo?: {
    id: string;
    name: string;
  } | null;
  dueDate?: Date | null;
  completedAt?: Date | null;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  constructor(design: any) {
    this.id = design._id?.toString() || design.id;
    this.title = design.title;
    this.description = design.description;
    this.type = design.type;
    this.status = design.status;
    this.files = design.files || [];
    this.thumbnail = design.thumbnail;
    this.tags = design.tags || [];
    this.isActive = design.isActive;
    
    if (design.client) {
      this.client = {
        id: design.client._id?.toString() || design.client.id,
        name: design.client.firstName && design.client.lastName 
          ? `${design.client.firstName} ${design.client.lastName}`
          : design.client.name || design.client.email,
        email: design.client.email
      };
    }
    
    if (design.createdBy) {
      this.createdBy = {
        id: design.createdBy._id?.toString() || design.createdBy.id,
        name: design.createdBy.firstName && design.createdBy.lastName
          ? `${design.createdBy.firstName} ${design.createdBy.lastName}`
          : design.createdBy.name || design.createdBy.email
      };
    }
    
    if (design.assignedTo) {
      this.assignedTo = {
        id: design.assignedTo._id?.toString() || design.assignedTo.id,
        name: design.assignedTo.firstName && design.assignedTo.lastName
          ? `${design.assignedTo.firstName} ${design.assignedTo.lastName}`
          : design.assignedTo.name || design.assignedTo.email
      };
    }
    
    this.dueDate = design.dueDate;
    this.completedAt = design.completedAt;
    this.metadata = design.metadata;
    this.createdAt = design.createdAt;
    this.updatedAt = design.updatedAt;
  }
}