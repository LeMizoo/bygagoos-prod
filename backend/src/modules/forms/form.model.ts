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
  options?: string[];
  order: number;
}

/**
 * Interface pour le document complet
 */
export interface IDynamicForm extends Document {
  slug: string;
  title: string;
  description?: string;
  fields: IFormField[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Sous-schema pour les champs du formulaire
 */
const FormFieldSchema = new Schema<IFormField>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'number', 'dropdown', 'textarea', 'email', 'tel'],
      default: 'text',
    },
    required: { type: Boolean, default: false },
    placeholder: { type: String },
    options: { type: [String], default: [] },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

/**
 * Schema principal
 */
const DynamicFormSchema = new Schema<IDynamicForm>(
  {
    slug: {
      type: String,
      required: true,
      unique: true, // ✅ suffit pour créer l’index
      lowercase: true,
      trim: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    fields: [FormFieldSchema],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

/**
 * ❌ SUPPRIMÉ :
 * DynamicFormSchema.index({ slug: 1 });
 */

/**
 * Export du modèle
 */
export default mongoose.model<IDynamicForm>('DynamicForm', DynamicFormSchema);