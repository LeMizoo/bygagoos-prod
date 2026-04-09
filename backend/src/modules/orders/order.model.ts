import mongoose, { Schema, Document, Types } from 'mongoose';

// --- ENUMS ---
export enum OrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  MODIFICATION = 'MODIFICATION',
  VALIDATED = 'VALIDATED',
  PRODUCTION = 'PRODUCTION',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  ARCHIVED = 'ARCHIVED'
}

export enum OrderPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  PAYPAL = 'PAYPAL',
  OTHER = 'OTHER'
}

// --- INTERFACES ---
export interface IOrderItem {
  _id?: Types.ObjectId;
  design?: Types.ObjectId;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}

export interface IPayment {
  status: PaymentStatus;
  method?: PaymentMethod;
  dueDate?: Date;
  paidAt?: Date;
  transactions: Array<{
    amount: number;
    method: PaymentMethod;
    reference?: string;
    date: Date;
  }>;
}

export interface IOrderDesign {
  _id?: Types.ObjectId;
  design: Types.ObjectId;
  quantity: number;
  price: number;
  modifications?: string;
  previewUrl?: string;
  files?: Array<{
    url: string;
    filename: string;
    mimetype: string;
    uploadedAt: Date;
  }>;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completedAt?: Date;
}

export interface IOrderHistory {
  status: OrderStatus;
  changedBy: Types.ObjectId;
  comment?: string;
  createdAt: Date;
}

export interface IOrderMessage {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  content: string;
  attachments?: Array<{
    url: string;
    filename: string;
  }>;
  readBy: Array<{
    user: Types.ObjectId;
    readAt: Date;
  }>;
  createdAt: Date;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  tenant?: Types.ObjectId;
  client: Types.ObjectId;
  orderNumber: string;
  title: string;
  description?: string;
  status: OrderStatus;
  priority: OrderPriority;
  assignedTo: {
    designer?: Types.ObjectId;
    validator?: Types.ObjectId;
    producer?: Types.ObjectId;
  };
  designs: Types.DocumentArray<IOrderDesign & mongoose.Document>;
  requestedDate: Date;
  startDate?: Date;
  deadline?: Date;
  completedAt?: Date;
  price: {
    subtotal: number;
    taxRate: number;
    tax: number;
    discount?: {
      type: 'percentage' | 'fixed';
      value: number;
      reason?: string;
    };
    total: number;
    currency: string;
  };
  payment: {
    status: PaymentStatus;
    method?: PaymentMethod;
    dueDate?: Date;
    paidAt?: Date;
    transactions: Array<{
      amount: number;
      method: PaymentMethod;
      reference?: string;
      date: Date;
    }>;
  };
  messages: Types.DocumentArray<IOrderMessage & mongoose.Document>;
  history: Types.DocumentArray<IOrderHistory & mongoose.Document>;
  tags: string[];
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // Méthodes
  calculateTotals(): void;
  updateStatus(newStatus: OrderStatus, userId: string | Types.ObjectId, comment?: string): Promise<void>;
  addMessage(message: { user: Types.ObjectId; content: string; attachments?: any[] }): Promise<void>;
}

// --- SCHEMAS ---

const orderDesignSchema = new Schema({
  design: { type: Schema.Types.ObjectId, ref: 'Design', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price: { type: Number, required: true, min: 0 },
  modifications: { type: String, trim: true },
  previewUrl: { type: String },
  files: [{
    url: { type: String, required: true },
    filename: { type: String, required: true },
    mimetype: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  completedAt: Date
});

const orderHistorySchema = new Schema({
  status: { type: String, enum: Object.values(OrderStatus), required: true },
  changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

const orderMessageSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
  attachments: [{ url: String, filename: String }],
  readBy: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant' },
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    orderNumber: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000 },
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING, required: true },
    priority: { type: String, enum: Object.values(OrderPriority), default: OrderPriority.MEDIUM, required: true },
    assignedTo: {
      designer: { type: Schema.Types.ObjectId, ref: 'User' },
      validator: { type: Schema.Types.ObjectId, ref: 'User' },
      producer: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    designs: [orderDesignSchema],
    requestedDate: { type: Date, required: true },
    startDate: Date,
    deadline: Date,
    completedAt: Date,
    price: {
      subtotal: { type: Number, required: true, default: 0 },
      taxRate: { type: Number, default: 20 },
      tax: { type: Number, required: true, default: 0 },
      discount: {
        type: { type: String, enum: ['percentage', 'fixed'] },
        value: Number,
        reason: String
      },
      total: { type: Number, required: true, default: 0 },
      currency: { type: String, default: 'EUR', uppercase: true }
    },
    payment: {
      status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
      method: { type: String, enum: Object.values(PaymentMethod) },
      dueDate: Date,
      paidAt: Date,
      transactions: [{
        amount: Number,
        method: { type: String, enum: Object.values(PaymentMethod) },
        reference: String,
        date: { type: Date, default: Date.now }
      }]
    },
    messages: [orderMessageSchema],
    history: [orderHistorySchema],
    tags: [String],
    isActive: { type: Boolean, default: true },
    metadata: { type: Schema.Types.Mixed },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { 
    timestamps: true,
    toJSON: { transform: (_, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; return ret; } } 
  }
);

// --- UTILS & METHODS ---

const roundValue = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100;

orderSchema.methods.calculateTotals = function(this: IOrder) {
  const subtotal = this.designs.reduce((sum, d) => sum + (d.price * d.quantity), 0);
  this.price.subtotal = roundValue(subtotal);

  let afterDiscount = this.price.subtotal;
  if (this.price.discount?.value) {
    if (this.price.discount.type === 'percentage') {
      afterDiscount = this.price.subtotal * (1 - this.price.discount.value / 100);
    } else {
      afterDiscount = Math.max(0, this.price.subtotal - this.price.discount.value);
    }
  }

  this.price.tax = roundValue(afterDiscount * (this.price.taxRate / 100));
  this.price.total = roundValue(afterDiscount + this.price.tax);
};

orderSchema.methods.updateStatus = async function(this: IOrder, newStatus: OrderStatus, userId: string | Types.ObjectId, comment?: string) {
  const oldStatus = this.status;
  if (oldStatus === newStatus) return;

  const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

  this.status = newStatus;
  this.history.push({
    status: newStatus,
    changedBy: userObjectId,
    comment: comment || `Transition: ${oldStatus} ➔ ${newStatus}`,
    createdAt: new Date()
  } as any);

  // Actions automatiques selon le statut
  if (newStatus === OrderStatus.IN_PROGRESS && !this.startDate) this.startDate = new Date();
  if (newStatus === OrderStatus.DELIVERED && !this.completedAt) this.completedAt = new Date();

  await this.save();
};

orderSchema.methods.addMessage = async function(this: IOrder, message: { user: Types.ObjectId; content: string; attachments?: any[] }) {
  this.messages.push({
    ...message,
    readBy: [{ user: message.user, readAt: new Date() }],
    createdAt: new Date()
  } as any);
  await this.save();
};

// --- MIDDLEWARES ---

orderSchema.pre('save', function(this: IOrder, next) {
  // Génération du numéro de commande unique
  if (this.isNew && !this.orderNumber) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `CMD-${dateStr}-${randomSuffix}`;
  }

  // Recalcul des totaux si les prix ou designs changent
  if (this.isModified('designs') || this.isModified('price.discount') || this.isModified('price.taxRate')) {
    this.calculateTotals();
  }

  next();
});

const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;