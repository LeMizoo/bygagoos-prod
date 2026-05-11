import mongoose, { Schema, Document } from 'mongoose';

export enum TaxiVehicleStatus {
  AVAILABLE = 'AVAILABLE',
  IN_SERVICE = 'IN_SERVICE',
  MAINTENANCE = 'MAINTENANCE',
  RENTED = 'RENTED',
  OFFLINE = 'OFFLINE',
}

export interface ITaxiVehicle extends Document {
  user: mongoose.Types.ObjectId;
  tenant?: mongoose.Types.ObjectId;
  plateNumber: string;
  brand: string;
  vehicleModel: string;
  color?: string;
  year?: number;
  status: TaxiVehicleStatus;
  currentMileage?: number;
  lastMaintenanceAt?: Date;
  notes?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taxiVehicleSchema = new Schema<ITaxiVehicle>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'utilisateur est requis"],
    },
    tenant: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
    },
    plateNumber: {
      type: String,
      required: [true, 'La plaque est requise'],
      trim: true,
      uppercase: true,
    },
    brand: {
      type: String,
      required: [true, 'La marque est requise'],
      trim: true,
    },
    vehicleModel: {
      type: String,
      required: [true, 'Le modèle est requis'],
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    year: {
      type: Number,
      min: 1950,
      max: 2100,
    },
    status: {
      type: String,
      enum: Object.values(TaxiVehicleStatus),
      default: TaxiVehicleStatus.AVAILABLE,
    },
    currentMileage: {
      type: Number,
      min: 0,
      default: 0,
    },
    lastMaintenanceAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

taxiVehicleSchema.index({ user: 1, plateNumber: 1 }, { unique: true });
taxiVehicleSchema.index({ user: 1, status: 1 });
taxiVehicleSchema.index({ user: 1, brand: 1, model: 1 });
taxiVehicleSchema.index({ plateNumber: 'text', brand: 'text', model: 'text', notes: 'text' });

const TaxiVehicle = mongoose.model<ITaxiVehicle>('TaxiVehicle', taxiVehicleSchema);

export default TaxiVehicle;
