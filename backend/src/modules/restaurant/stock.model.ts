import mongoose, { Schema, Document, Types } from 'mongoose';

// --- ENUMS ---
export enum StockAlertLevel {
  CRITICAL = 'CRITICAL',
  LOW = 'LOW',
  NORMAL = 'NORMAL'
}

export enum StockMovementType {
  IN = 'IN',
  OUT = 'OUT'
}

export enum StockMovementReason {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  WASTE = 'WASTE',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN'
}

// --- INTERFACES ---
export interface IStockItem extends Document {
  _id: Types.ObjectId;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  maxCapacity: number;
  alertLevel: StockAlertLevel;
  supplier?: string;
  lastRestockDate?: Date;
  expiryDate?: Date;
  notes?: string;
  isActive: boolean;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStockMovement extends Document {
  _id: Types.ObjectId;
  itemId: Types.ObjectId;
  type: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: StockMovementReason;
  note?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

// --- SCHEMAS ---
const stockItemSchema = new Schema<IStockItem>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    unit: { type: String, required: true, trim: true },
    minThreshold: { type: Number, required: true, default: 5 },
    maxCapacity: { type: Number, required: true, default: 100 },
    alertLevel: { type: String, enum: Object.values(StockAlertLevel), default: StockAlertLevel.NORMAL },
    supplier: { type: String, trim: true },
    lastRestockDate: { type: Date },
    expiryDate: { type: Date },
    notes: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
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

const stockMovementSchema = new Schema<IStockMovement>(
  {
    itemId: { type: Schema.Types.ObjectId, ref: 'StockItem', required: true },
    type: { type: String, enum: Object.values(StockMovementType), required: true },
    quantity: { type: Number, required: true, min: 0 },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    reason: { type: String, enum: Object.values(StockMovementReason), required: true },
    note: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export const StockItem = mongoose.model<IStockItem>('StockItem', stockItemSchema);
export const StockMovement = mongoose.model<IStockMovement>('StockMovement', stockMovementSchema);