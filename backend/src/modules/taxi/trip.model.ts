import mongoose, { Schema, Document, Types } from 'mongoose';

// --- ENUMS ---
export enum TripStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// --- INTERFACES ---
export interface ITrip extends Document {
  _id: Types.ObjectId;
  vehicle: Types.ObjectId;
  driver?: Types.ObjectId;
  passenger: string;
  pickupLocation: string;
  dropLocation: string;
  startTime: Date;
  endTime?: Date;
  distance?: number; // km
  fare: number;
  status: TripStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// --- SCHEMA ---
const tripSchema = new Schema<ITrip>(
  {
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'Staff'
    },
    passenger: {
      type: String,
      required: true
    },
    pickupLocation: {
      type: String,
      required: true
    },
    dropLocation: {
      type: String,
      required: true
    },
    startTime: {
      type: Date,
      required: true,
      default: () => new Date()
    },
    endTime: Date,
    distance: Number,
    fare: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(TripStatus),
      default: TripStatus.PENDING
    },
    notes: String
  },
  { timestamps: true }
);

const Trip = mongoose.model<ITrip>('Trip', tripSchema);

export default Trip;
