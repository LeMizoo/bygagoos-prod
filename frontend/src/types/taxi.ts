export type TaxiVehicleStatus = "AVAILABLE" | "IN_SERVICE" | "MAINTENANCE" | "RENTED" | "OFFLINE";

export interface TaxiVehicle {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  color?: string;
  year?: number;
  status: TaxiVehicleStatus;
  currentMileage?: number;
  lastMaintenanceAt?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    email?: string;
  };
}

export interface TaxiVehicleStats {
  total: number;
  byStatus: Record<string, number>;
  recent: number;
}

export interface CreateTaxiVehicleDto {
  plateNumber: string;
  brand: string;
  model: string;
  color?: string;
  year?: number;
  status?: TaxiVehicleStatus;
  currentMileage?: number;
  lastMaintenanceAt?: string;
  notes?: string;
}

export interface UpdateTaxiVehicleDto extends Partial<CreateTaxiVehicleDto> {}