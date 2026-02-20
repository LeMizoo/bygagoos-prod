import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { UserRole } from '../../core/types/userRoles';

// Interface pour les méthodes du document
export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Interface pour le document User (avec méthodes)
export interface IUser extends Document {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
  phone?: string;
  lastLogin?: Date;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Type pour le modèle User (avec méthodes statiques si nécessaire)
export type UserModel = Model<IUser, {}, IUserMethods>;

// Définition des rôles autorisés pour la validation
export const VALID_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'MANAGER',
  'DESIGNER',
  'STAFF',
  'CLIENT',
  'USER',
  'super-admin',
  'admin-inspiration',
  'admin-production',
  'admin-communication',
  'client',
  'user',
  'staff',
  'admin'
] as const;

export type ValidRole = typeof VALID_ROLES[number];

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: {
      type: String,
      required: [true, 'L\'email est requis'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide']
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
      select: false
    },
    firstName: {
      type: String,
      required: false,
      trim: true
    },
    lastName: {
      type: String,
      required: false,
      trim: true
    },
    name: {
      type: String,
      required: false,
      trim: true
    },
    role: {
      type: String,
      enum: VALID_ROLES,
      default: UserRole.CLIENT,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    avatar: {
      type: String,
      default: null
    },
    phone: {
      type: String,
      trim: true
    },
    lastLogin: {
      type: Date
    },
    passwordChangedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        // Conversion _id -> id
        ret.id = doc._id;
        
        // Créer un nom complet si nécessaire
        if (!ret.name) {
          if (ret.firstName && ret.lastName) {
            ret.name = `${ret.firstName} ${ret.lastName}`;
          } else if (ret.firstName) {
            ret.name = ret.firstName;
          } else if (ret.lastName) {
            ret.name = ret.lastName;
          } else {
            ret.name = ret.email?.split('@')[0] || 'Utilisateur';
          }
        }
        
        // Supprimer les champs sensibles
        const { _id, __v, password, ...result } = ret;
        return result;
      }
    }
  }
);

// Virtual pour le nom complet
userSchema.virtual('fullName').get(function(this: IUser) {
  if (this.name) return this.name;
  if (this.firstName && this.lastName) return `${this.firstName} ${this.lastName}`;
  if (this.firstName) return this.firstName;
  if (this.lastName) return this.lastName;
  return this.email?.split('@')[0] || 'Utilisateur';
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(
  this: IUser,
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Middleware pre-save pour hasher le mot de passe
userSchema.pre('save', async function(this: IUser, next) {
  try {
    // Normaliser les noms si nécessaire
    if (!this.name && this.firstName && this.lastName) {
      this.name = `${this.firstName} ${this.lastName}`;
    } else if (this.name && !this.firstName && !this.lastName) {
      const nameParts = this.name.split(' ');
      this.firstName = nameParts[0] || '';
      this.lastName = nameParts.slice(1).join(' ') || '';
    }
    
    // Hasher le mot de passe si modifié
    if (!this.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = new Date();
    next();
  } catch (error: any) {
    next(error);
  }
});

// Middleware pre-update pour gérer les mises à jour
userSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate() as any;
  if (update.password) {
    const salt = await bcrypt.genSalt(10);
    update.password = await bcrypt.hash(update.password, salt);
    update.passwordChangedAt = new Date();
  }
  next();
});

// Index pour les recherches
userSchema.index({ firstName: 'text', lastName: 'text', email: 'text', name: 'text' });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

const User = mongoose.model<IUser, UserModel>('User', userSchema);

export default User;