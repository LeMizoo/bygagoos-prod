import mongoose, { Schema, Document } from 'mongoose';

export enum StaffCategory {
  DESIGNER = 'DESIGNER',
  ACCOUNTANT = 'ACCOUNTANT',
  MANAGER = 'MANAGER',
  SALES = 'SALES',
  PRODUCTION = 'PRODUCTION'
}

export enum StaffRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SUPERVISOR = 'SUPERVISOR',
  STAFF = 'STAFF',
  TRAINEE = 'TRAINEE'
}

export interface IStaff extends Document {
  user: mongoose.Types.ObjectId;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  category: StaffCategory;
  role: StaffRole;
  responsibilities: string[];
  profileImage?: string;
  phone?: string;
  address?: string;
  bio?: string;
  joinedAt: Date;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const staffSchema = new Schema<IStaff>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'utilisateur est requis"],
      unique: true
    },
    displayName: {
      type: String,
      required: [true, 'Le nom affiché est requis'],
      trim: true
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
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide']
    },
    category: {
      type: String,
      enum: Object.values(StaffCategory),
      required: [true, 'La catégorie est requise']
    },
    role: {
      type: String,
      enum: Object.values(StaffRole),
      default: StaffRole.STAFF
    },
    responsibilities: [{
      type: String,
      trim: true
    }],
    profileImage: {
      type: String,
      default: null
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
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
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      }
    }
  }
);

// Index pour les recherches
// Note: email index créé automatiquement par unique: true
staffSchema.index({ category: 1 });
staffSchema.index({ isActive: 1 });
staffSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

const Staff = mongoose.model<IStaff>('Staff', staffSchema);
export default Staff;