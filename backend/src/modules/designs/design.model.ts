import mongoose, { Schema, Document } from 'mongoose';

export enum DesignStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED'
}

export enum DesignType {
  LOGO = 'LOGO',
  BRANDING = 'BRANDING',
  PACKAGING = 'PACKAGING',
  PRINT = 'PRINT',
  DIGITAL = 'DIGITAL',
  ILLUSTRATION = 'ILLUSTRATION',
  OTHER = 'OTHER'
}

export interface IDesignFile {
  url: string;
  publicId: string;
  filename: string;
  mimetype: string;
  size: number;
  uploadedAt: Date;
}

export interface IDesign extends Document {
  user: mongoose.Types.ObjectId;
  tenant?: mongoose.Types.ObjectId;
  client?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: DesignType;
  status: DesignStatus;
  files: IDesignFile[];
  thumbnail?: string;
  tags: string[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  dueDate?: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const designFileSchema = new Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  filename: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const designSchema = new Schema<IDesign>(
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
      ref: 'Client'
    },
    title: {
      type: String,
      required: [true, 'Le titre est requis'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: Object.values(DesignType),
      required: [true, 'Le type de design est requis'],
      default: DesignType.OTHER
    },
    status: {
      type: String,
      enum: Object.values(DesignStatus),
      default: DesignStatus.DRAFT
    },
    files: [designFileSchema],
    thumbnail: {
      type: String
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
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    dueDate: {
      type: Date
    },
    completedAt: {
      type: Date
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
designSchema.index({ user: 1 });
designSchema.index({ client: 1 });
designSchema.index({ status: 1 });
designSchema.index({ type: 1 });
designSchema.index({ assignedTo: 1 });
designSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Design = mongoose.model<IDesign>('Design', designSchema);
export default Design;