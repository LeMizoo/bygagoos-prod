// backend/src/modules/staff/staff.model.ts (version simplifiée et corrigée)

import mongoose, { Schema, Document } from 'mongoose';

// Types
export type StaffRole = string;
export type StaffCategory = string;
export type StaffDepartment = string;

export interface IStaff extends Document {
  // Informations de base
  firstName: string;
  lastName: string;
  name?: string;
  displayName?: string;
  
  // Contact
  email: string;
  phone?: string;
  
  // Professionnel
  position?: string;
  department: string;
  role: string;
  category: string;
  responsibilities?: string[];
  skills?: string[];
  
  // Statut
  isActive: boolean;
  active: boolean;
  
  // Description
  description?: string;
  notes?: string;
  bio?: string;
  
  // Média
  avatar?: string;
  profileImage?: string;
  
  // Relations
  user?: mongoose.Types.ObjectId;
  
  // Dates
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schéma
const StaffSchema = new Schema<IStaff>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
    displayName: { type: String, trim: true },
    
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    phone: { type: String, trim: true },
    
    position: { type: String, trim: true },
    department: { type: String, default: 'PRODUCTION' },
    role: { type: String, default: 'STAFF' },
    category: { type: String, default: 'PRODUCTION' },
    responsibilities: [{ type: String }],
    skills: [{ type: String }],
    
    isActive: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
    
    description: { type: String },
    notes: { type: String },
    bio: { type: String },
    
    avatar: { type: String },
    profileImage: { type: String },
    
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    joinedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index (le champ `email` a déjà `unique: true` sur la propriété, éviter double déclaration)
StaffSchema.index({ role: 1 });
StaffSchema.index({ department: 1 });
StaffSchema.index({ isActive: 1 });

// Middleware pre-save
StaffSchema.pre('save', function(next) {
  // Générer le nom complet
  if (this.firstName && this.lastName) {
    const fullName = `${this.firstName} ${this.lastName}`.trim();
    if (!this.name) this.name = fullName;
    if (!this.displayName) this.displayName = fullName;
  }
  
  // Synchroniser les champs
  this.active = this.isActive;
  
  if (this.avatar && !this.profileImage) this.profileImage = this.avatar;
  if (this.profileImage && !this.avatar) this.avatar = this.profileImage;
  
  if (this.description && !this.bio) this.bio = this.description;
  if (this.bio && !this.description) this.description = this.bio;
  
  next();
});

// Virtual - Cette fois correctement typé
StaffSchema.virtual('fullName').get(function() {
  return this.name || `${this.firstName} ${this.lastName}`.trim();
});

// Méthode d'instance - Sans utiliser this.fullName directement
StaffSchema.methods.getFullName = function() {
  return this.name || `${this.firstName} ${this.lastName}`.trim();
};

// Méthodes statiques
StaffSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

StaffSchema.statics.findByDepartment = function(department: string) {
  return this.find({ department });
};

StaffSchema.statics.findByRole = function(role: string) {
  return this.find({ role });
};

// Export
export const StaffModel = mongoose.model<IStaff>('Staff', StaffSchema);
export default StaffModel;