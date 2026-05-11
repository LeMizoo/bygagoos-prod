import mongoose, { Schema, Document, Types } from 'mongoose';

// --- ENUMS ---
export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW'
}

// --- INTERFACES ---
export interface IReservation extends Document {
  _id: Types.ObjectId;
  guestName: string;
  guestEmail?: string;
  guestPhone: string;
  reservationDate: Date;
  reservationTime: string; // HH:mm format
  partySize: number;
  table?: Types.ObjectId;
  specialRequests?: string;
  status: ReservationStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// --- SCHEMA ---
const reservationSchema = new Schema<IReservation>(
  {
    guestName: {
      type: String,
      required: true
    },
    guestEmail: String,
    guestPhone: {
      type: String,
      required: true
    },
    reservationDate: {
      type: Date,
      required: true
    },
    reservationTime: {
      type: String,
      required: true
    },
    partySize: {
      type: Number,
      required: true,
      min: 1
    },
    table: {
      type: Schema.Types.ObjectId,
      ref: 'RestaurantTable'
    },
    specialRequests: String,
    status: {
      type: String,
      enum: Object.values(ReservationStatus),
      default: ReservationStatus.PENDING
    },
    notes: String
  },
  { timestamps: true }
);

const Reservation = mongoose.model<IReservation>('Reservation', reservationSchema);

export default Reservation;
