import mongoose, { Schema, Document } from 'mongoose';

export interface IDriver extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseType: 'A' | 'A1' | 'A2' | 'B';
  experienceYears: number;
  status: 'AVAILABLE' | 'ON_DUTY' | 'OFF_DUTY' | 'SUSPENDED';
  vehicleId?: mongoose.Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<IDriver>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    licenseType: {
      type: String,
      enum: ['A', 'A1', 'A2', 'B'],
      required: true,
      default: 'A'
    },
    experienceYears: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['AVAILABLE', 'ON_DUTY', 'OFF_DUTY', 'SUSPENDED'],
      default: 'AVAILABLE'
    },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', default: null },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalTrips: { type: Number, default: 0 },
    avatar: { type: String },
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relationship: { type: String, trim: true }
    },
    notes: { type: String, trim: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Index pour les recherches rapides
DriverSchema.index({ email: 1 });
DriverSchema.index({ status: 1 });
DriverSchema.index({ vehicleId: 1 });

export default mongoose.model<IDriver>('Driver', DriverSchema);