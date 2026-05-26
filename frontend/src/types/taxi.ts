// ==================== TYPES VÉHICULES ====================
export type TaxiVehicleStatus = "AVAILABLE" | "IN_SERVICE" | "MAINTENANCE" | "RENTED" | "OFFLINE";

export interface TaxiVehicle {
  id: string;
  _id?: string;
  plateNumber: string;
  brand: string;
  model: string;
  color?: string;
  year?: number;
  status: TaxiVehicleStatus;
  currentLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
    heading?: number;
    speed?: number;
    updatedAt?: string;
  };
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
  currentLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
    heading?: number;
    speed?: number;
    updatedAt?: string;
  };
  currentMileage?: number;
  lastMaintenanceAt?: string;
  notes?: string;
}

export type UpdateTaxiVehicleDto = Partial<CreateTaxiVehicleDto>;

// ==================== TYPES CONDUCTEURS (DRIVERS) ====================
export type DriverStatus = 'AVAILABLE' | 'ON_DUTY' | 'OFF_DUTY' | 'SUSPENDED';
export type LicenseType = 'A' | 'A1' | 'A2' | 'B';

export interface Driver {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseType: LicenseType;
  experienceYears: number;
  status: DriverStatus;
  vehicleId?: string | { _id?: string; licensePlate: string; model: string };
  rating: number;
  totalTrips: number;
  avatar?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDriverDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseType: LicenseType;
  experienceYears?: number;
  status?: DriverStatus;
  vehicleId?: string;
  notes?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export type UpdateDriverDto = Partial<CreateDriverDto>;

export interface DriverStats {
  total: number;
  available: number;
  onDuty: number;
  offDuty: number;
  suspended: number;
  avgRating: number;
  topDrivers: Array<{
    firstName: string;
    lastName: string;
    totalTrips: number;
    rating: number;
  }>;
}

// Type pour les trajets (trip)
export interface Trip {
  id: string;
  vehicleId: string | { licensePlate: string; model: string };
  driverId?: string | { firstName: string; lastName: string };
  pickupLocation: string;
  dropLocation: string;
  passenger: string;
  fare: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startTime: Date;
  endTime?: Date;
  distance?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripDto {
  vehicleId: string;
  driverId?: string;
  pickupLocation: string;
  dropLocation: string;
  passenger: string;
  fare: number;
  startTime?: Date;
  notes?: string;
}
