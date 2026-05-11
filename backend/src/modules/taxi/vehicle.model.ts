import mongoose, { Schema, Document, Types } from 'mongoose';

// --- ENUMS ---
export enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE',
  DAMAGED = 'DAMAGED'
}

export enum VehicleType {
  MOTORCYCLE = 'MOTORCYCLE',
  TUKTUKS = 'TUKTUKS',
  CAR = 'CAR',
  VAN = 'VAN'
}

// --- INTERFACES ---
export interface IVehicle extends Document {
  _id: Types.ObjectId;
  registrationNumber: string;
  type: VehicleType;
  driver?: Types.ObjectId;
  currentStatus: VehicleStatus;
  mileage: number;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  fuelLevel: number; // 0-100
  insurance?: {
    expiryDate: Date;
    provider: string;
    policyNumber: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// --- SCHEMA ---
const vehicleSchema = new Schema<IVehicle>(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    type: {
      type: String,
      enum: Object.values(VehicleType),
      required: true
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      default: null
    },
    currentStatus: {
      type: String,
      enum: Object.values(VehicleStatus),
      default: VehicleStatus.ACTIVE
    },
    mileage: {
      type: Number,
      default: 0
    },
    lastMaintenanceDate: Date,
    nextMaintenanceDate: Date,
    fuelLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    insurance: {
      expiryDate: Date,
      provider: String,
      policyNumber: String
    },
    notes: String
  },
  { timestamps: true }
);

const Vehicle = mongoose.model<IVehicle>('Vehicle', vehicleSchema);

export default Vehicle;
