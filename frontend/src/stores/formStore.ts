import { create } from 'zustand';
import { IDynamicForm } from '../types/form';
import { getFormConfig, updateFormConfig, getAllForms } from '../api/adminForms.api';

interface FormState {
  forms: IDynamicForm[];
  currentForm: IDynamicForm | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAllForms: () => Promise<void>;
  fetchOneForm: (slug: string) => Promise<void>;
  saveForm: (slug: string, config: Partial<IDynamicForm>) => Promise<void>;
  clearError: () => void;
}

export const useFormStore = create<FormState>((set, get) => ({
  forms: [],
  currentForm: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchAllForms: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getAllForms();
      set({ forms: data, isLoading: false });
    } catch (err: any) {
      set({ error: "Impossible de charger les formulaires", isLoading: false });
    }
  },

  fetchOneForm: async (slug: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getFormConfig(slug);
      set({ currentForm: data, isLoading: false });
    } catch (err: any) {
      set({ error: `Erreur lors du chargement du formulaire ${slug}`, isLoading: false });
    }
  },

  saveForm: async (slug: string, config: Partial<IDynamicForm>) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateFormConfig(slug, config);
      // Mettre à jour la liste locale si nécessaire
      const currentForms = get().forms;
      const index = currentForms.findIndex(f => f.slug === slug);
      
      if (index !== -1) {
        currentForms[index] = updated;
        set({ forms: [...currentForms], currentForm: updated, isLoading: false });
      } else {
        set({ forms: [...currentForms, updated], currentForm: updated, isLoading: false });
      }
    } catch (err: any) {
      set({ error: "Erreur lors de l'enregistrement", isLoading: false });
      throw err;
    }
  }
}));