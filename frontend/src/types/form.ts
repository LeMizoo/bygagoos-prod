export type FieldType = 'text' | 'number' | 'dropdown' | 'textarea' | 'email' | 'tel';

export interface IFormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[]; // Pour le type 'dropdown'
  order: number;
}

export interface IDynamicForm {
  _id?: string;
  slug: string;
  title: string;
  description?: string;
  fields: IFormField[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface pour les données soumises par l'utilisateur final
 * Exemple: { "nom": "Tovo", "email": "tovo@example.com" }
 */
export interface FormSubmissionData {
  [key: string]: string | number | string[];
}