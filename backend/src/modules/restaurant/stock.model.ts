import mongoose, { Schema, Document, Types } from 'mongoose';

// --- ENUMS ---
export enum StockAlertLevel {
  CRITICAL = 'CRITICAL',
  LOW = 'LOW',
  NORMAL = 'NORMAL'
}

// --- INTERFACES ---
export interface IStockItem extends Document {
  _id: Types.ObjectId;
  name: string;
  category: string;
  quantity: number;
  unit: string; // kg, L, units, etc.
  minThreshold: number;
  maxCapacity: number;
  alertLevel: StockAlertLevel;
  supplier?: string;
  lastRestockDate?: Date;
  expiryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// --- SCHEMA ---
const stockItemSchema = new Schema<IStockItem>(
  {
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 0
    },
    unit: {
      type: String,
      required: true
    },
    minThreshold: {
      type: Number,
      required: true
    },
    maxCapacity: {
      type: Number,
      required: true
    },
    alertLevel: {
      type: String,
      enum: Object.values(StockAlertLevel),
      default: StockAlertLevel.NORMAL
    },
    supplier: String,
    lastRestockDate: Date,
    expiryDate: Date,
    notes: String
  },
  { timestamps: true }
);

// Middleware to update alertLevel based on quantity
stockItemSchema.pre('save', function (next) {
  if (this.quantity <= this.minThreshold) {
    this.alertLevel = StockAlertLevel.CRITICAL;
  } else if (this.quantity <= this.minThreshold * 1.5) {
    this.alertLevel = StockAlertLevel.LOW;
  } else {
    this.alertLevel = StockAlertLevel.NORMAL;
  }
  next();
});

const StockItem = mongoose.model<IStockItem>('StockItem', stockItemSchema);

export default StockItem;
