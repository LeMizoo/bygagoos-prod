import mongoose, { Schema, Document, Types } from 'mongoose';

// --- INTERFACES ---
export interface IMaintenance extends Document {
  _id: Types.ObjectId;
  vehicle: Types.ObjectId;
  type: string; // Oil change, Tire replacement, etc.
  date: Date;
  cost: number;
  mechanic?: string;
  notes?: string;
  nextDueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// --- SCHEMA ---
const maintenanceSchema = new Schema<IMaintenance>(
  {
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true
    },
    type: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    cost: {
      type: Number,
      required: true
    },
    mechanic: String,
    notes: String,
    nextDueDate: Date
  },
  { timestamps: true }
);

const Maintenance = mongoose.model<IMaintenance>('Maintenance', maintenanceSchema);

export default Maintenance;
