import { TaxiVehicleStatus } from '../vehicle.model';

export class TaxiVehicleResponseDTO {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  color?: string;
  year?: number;
  status: TaxiVehicleStatus;
  currentMileage?: number;
  lastMaintenanceAt?: Date | null;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: {
    id: string;
    name: string;
    email?: string;
  };

  constructor(vehicle: any) {
    this.id = vehicle._id?.toString() || vehicle.id;
    this.plateNumber = vehicle.plateNumber;
    this.brand = vehicle.brand;
    this.model = vehicle.vehicleModel || vehicle.model;
    this.color = vehicle.color;
    this.year = vehicle.year;
    this.status = vehicle.status;
    this.currentMileage = vehicle.currentMileage;
    this.lastMaintenanceAt = vehicle.lastMaintenanceAt;
    this.notes = vehicle.notes;
    this.isActive = vehicle.isActive;
    this.createdAt = vehicle.createdAt;
    this.updatedAt = vehicle.updatedAt;

    if (vehicle.createdBy) {
      this.createdBy = {
        id: vehicle.createdBy._id?.toString() || vehicle.createdBy.id,
        name: vehicle.createdBy.firstName && vehicle.createdBy.lastName
          ? `${vehicle.createdBy.firstName} ${vehicle.createdBy.lastName}`
          : vehicle.createdBy.name || vehicle.createdBy.email,
        email: vehicle.createdBy.email,
      };
    }
  }
}
