import mongoose, { Schema, Document } from 'mongoose';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE'
}

export interface IOrderItem {
  design?: mongoose.Types.ObjectId;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}

export interface IPayment {
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paidAt?: Date;
  notes?: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  tenant?: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  payments: IPayment[];
  paymentStatus: PaymentStatus;
  paymentDue?: Date;
  notes?: string;
  terms?: string;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelledReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema({
  design: {
    type: Schema.Types.ObjectId,
    ref: 'Design'
  },
  description: {
    type: String,
    required: [true, 'La description est requise']
  },
  quantity: {
    type: Number,
    required: [true, 'La quantité est requise'],
    min: [1, 'La quantité doit être au moins 1']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Le prix unitaire est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  total: {
    type: Number,
    required: [true, 'Le total est requis'],
    min: [0, 'Le total ne peut pas être négatif']
  },
  notes: {
    type: String,
    trim: true
  }
});

const paymentSchema = new Schema({
  amount: {
    type: Number,
    required: [true, 'Le montant est requis'],
    min: [0, 'Le montant ne peut pas être négatif']
  },
  method: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: [true, 'La méthode de paiement est requise']
  },
  status: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING
  },
  transactionId: {
    type: String,
    trim: true
  },
  paidAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
});

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'utilisateur est requis"]
    },
    tenant: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant'
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Le client est requis']
    },
    orderNumber: {
      type: String,
      required: [true, 'Le numéro de commande est requis'],
      unique: true
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: [true, 'Le sous-total est requis'],
      min: [0, 'Le sous-total ne peut pas être négatif']
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'La taxe ne peut pas être négative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'La remise ne peut pas être négative']
    },
    total: {
      type: Number,
      required: [true, 'Le total est requis'],
      min: [0, 'Le total ne peut pas être négatif']
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING
    },
    payments: [paymentSchema],
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING
    },
    paymentDue: {
      type: Date
    },
    notes: {
      type: String,
      trim: true
    },
    terms: {
      type: String,
      trim: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: {
      type: Date
    },
    cancelledAt: {
      type: Date
    },
    cancelledReason: {
      type: String,
      trim: true
    },
    metadata: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Index pour les recherches
// Note: orderNumber index créé automatiquement par unique: true
orderSchema.index({ user: 1 });
orderSchema.index({ client: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Génération automatique du numéro de commande
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `CMD-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;