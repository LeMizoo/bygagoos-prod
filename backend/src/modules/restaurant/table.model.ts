import mongoose, { Schema, Document, Types } from 'mongoose';

// --- ENUMS ---
export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE'
}

// --- INTERFACES ---
export interface IRestaurantTable extends Document {
  _id: Types.ObjectId;
  tableNumber: string;
  capacity: number;
  location: string;
  status: TableStatus;
  occupiedBy?: {
    guestName: string;
    checkInTime: Date;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// --- SCHEMA ---
const restaurantTableSchema = new Schema<IRestaurantTable>(
  {
    tableNumber: {
      type: String,
      required: true,
      unique: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    location: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(TableStatus),
      default: TableStatus.AVAILABLE
    },
    occupiedBy: {
      guestName: String,
      checkInTime: Date
    },
    notes: String
  },
  { timestamps: true }
);

const RestaurantTable = mongoose.model<IRestaurantTable>('RestaurantTable', restaurantTableSchema);

export default RestaurantTable;
