import mongoose, { Schema, Document, Types } from 'mongoose';

// --- INTERFACES ---
export interface IFleetChecklist extends Document {
  _id: Types.ObjectId;
  vehicle: Types.ObjectId;
  checklistDate: Date;
  checkedBy?: Types.ObjectId;
  items: Array<{
    name: string;
    status: 'OK' | 'NEEDS_ATTENTION' | 'REPAIR_REQUIRED';
    notes?: string;
  }>;
  overallStatus: 'PASS' | 'FAIL';
  nextCheckDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// --- SCHEMA ---
const fleetChecklistSchema = new Schema<IFleetChecklist>(
  {
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true
    },
    checklistDate: {
      type: Date,
      required: true,
      default: () => new Date()
    },
    checkedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Staff'
    },
    items: [
      {
        name: {
          type: String,
          required: true
        },
        status: {
          type: String,
          enum: ['OK', 'NEEDS_ATTENTION', 'REPAIR_REQUIRED'],
          default: 'OK'
        },
        notes: String
      }
    ],
    overallStatus: {
      type: String,
      enum: ['PASS', 'FAIL'],
      required: true
    },
    nextCheckDate: Date
  },
  { timestamps: true }
);

const FleetChecklist = mongoose.model<IFleetChecklist>('FleetChecklist', fleetChecklistSchema);

export default FleetChecklist;
