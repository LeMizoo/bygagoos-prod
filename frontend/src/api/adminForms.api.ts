import axiosInstance from './axiosInstance';

/**
 * Interface pour les champs (doit correspondre au backend)
 */
export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'dropdown' | 'textarea' | 'email' | 'tel';
  required: boolean;
  placeholder?: string;
  options?: string[];
  order: number;
}

/**
 * Interface pour la structure complète du formulaire
 */
export interface FormConfig {
  _id?: string;
  slug: string;
  title: string;
  description?: string;
  fields: FormField[];
  isActive: boolean;
  updatedAt?: string;
}

/**
 * Récupère la configuration d'un formulaire spécifique
 */
export const getFormConfig = async (slug: string): Promise<FormConfig> => {
  const response = await axiosInstance.get(`/forms/${slug}`);
  return response.data.data;
};

/**
 * Met à jour ou crée la configuration d'un formulaire
 */
export const updateFormConfig = async (slug: string, config: Partial<FormConfig>): Promise<FormConfig> => {
  const response = await axiosInstance.put(`/forms/${slug}`, config);
  return response.data.data;
};

/**
 * Liste tous les formulaires (Vue Admin)
 */
export const getAllForms = async (): Promise<FormConfig[]> => {
  const response = await axiosInstance.get('/forms');
  return response.data.data;
};