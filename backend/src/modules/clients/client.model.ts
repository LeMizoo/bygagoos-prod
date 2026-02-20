import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  user: mongoose.Types.ObjectId;
  tenant?: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  avatar?: string;
  notes?: string;
  tags?: string[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<IClient>(
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
    firstName: {
      type: String,
      required: [true, 'Le prénom est requis'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'L\'email est requis'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide']
    },
    phone: {
      type: String,
      trim: true
    },
    company: {
      type: String,
      trim: true
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true, default: 'France' }
    },
    avatar: {
      type: String,
      default: null
    },
    notes: {
      type: String,
      trim: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
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
clientSchema.index({ user: 1, email: 1 }, { unique: true });
clientSchema.index({ user: 1, company: 1 });
clientSchema.index({ firstName: 'text', lastName: 'text', email: 'text', company: 'text' });

const Client = mongoose.model<IClient>('Client', clientSchema);
export default Client;