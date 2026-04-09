import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface pour un champ individuel du formulaire
 */
export interface IFormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'dropdown' | 'textarea' | 'email' | 'tel';
  required: boolean;
  placeholder?: string;
  options?: string[]; // Utilisé uniquement si le type est 'dropdown'
  order: number;      // Pour gérer la position à l'affichage
}

/**
 * Interface pour le document complet en base de données
 */
export interface IDynamicForm extends Document {
  slug: string;       // Identifiant unique (ex: 'contact', 'devis-serigraphie')
  title: string;      // Nom affiché (ex: 'Formulaire de Devis')
  description?: string;
  fields: IFormField[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FormFieldSchema = new Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['text', 'number', 'dropdown', 'textarea', 'email', 'tel'], 
    default: 'text' 
  },
  required: { type: Boolean, default: false },
  placeholder: { type: String },
  options: { type: [String], default: [] },
  order: { type: Number, default: 0 }
}, { _id: false }); // Pas besoin d'ID MongoDB pour chaque champ interne

const DynamicFormSchema: Schema = new Schema({
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  title: { type: String, required: true },
  description: { type: String },
  fields: [FormFieldSchema],
  isActive: { type: Boolean, default: true }
}, { 
  timestamps: true // Gère automatiquement createdAt et updatedAt
});

// Indexation pour des recherches rapides par slug
DynamicFormSchema.index({ slug: 1 });

export default mongoose.model<IDynamicForm>('DynamicForm', DynamicFormSchema);