import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Send } from 'lucide-react';

// --- TYPES ---
export interface FormFieldConfig {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'textarea' | 'dropdown';
  placeholder?: string;
  required: boolean;
  options?: string[]; // Pour les dropdowns
}

interface DynamicFormProps {
  config: FormFieldConfig[];
  onSubmit: (data: Record<string, unknown>) => void;
  isLoading?: boolean;
  buttonText?: string;
}

export const DynamicFormRenderer: React.FC<DynamicFormProps> = ({ 
  config, 
  onSubmit, 
  isLoading = false,
  buttonText = "Envoyer ma demande"
}) => {
  
  // 1. Génération dynamique du schéma de validation Zod
  const generateSchema = () => {
    const shape: Record<string, z.ZodTypeAny> = {};
    config.forEach((field) => {
      let validator: z.ZodTypeAny;

      switch (field.type) {
        case 'email':
          validator = z.string().email('Email invalide');
          break;
        case 'number':
          // On valide que la chaîne représente un nombre (input HTML renvoie une string)
          validator = z
            .string()
            .refine((val) => val !== undefined && val !== null && val !== '' && !isNaN(Number(val)), {
              message: 'Doit être un nombre'
            });
          break;
        default:
          validator = z.string();
      }

      if (field.required) {
        // .min est disponible sur z.string()
        validator = (validator as z.ZodString).min(1, `${field.label} est requis`);
      } else {
        validator = validator.optional();
      }

      shape[field.name] = validator;
    });
    return z.object(shape);
  };

  const dynamicSchema = generateSchema();
  // Pour les formulaires dynamiques, on utilise un type générique clé/valeur
  type FormData = Record<string, unknown>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(dynamicSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {config.map((field) => (
        <div key={field.id} className="space-y-1.5">
          <label htmlFor={field.name} className="text-sm font-bold text-gray-700">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>

          {/* RENDU SELON LE TYPE */}
          {field.type === 'textarea' ? (
            <textarea
              id={field.name}
              placeholder={field.placeholder}
              {...register(field.name)}
              className={`w-full p-3 rounded-xl border-2 transition-all outline-none h-32 ${
                errors[field.name] ? 'border-red-200 bg-red-50 focus:border-red-500' : 'border-gray-100 bg-gray-50 focus:border-blue-500 focus:bg-white'
              }`}
            />
          ) : field.type === 'dropdown' ? (
            <select
              id={field.name}
              {...register(field.name)}
              className={`w-full p-3 rounded-xl border-2 transition-all outline-none ${
                errors[field.name] ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'
              }`}
            >
              <option value="">Sélectionnez une option...</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              id={field.name}
              type={field.type}
              placeholder={field.placeholder}
              {...register(field.name)}
              className={`w-full p-3 rounded-xl border-2 transition-all outline-none ${
                errors[field.name] ? 'border-red-200 bg-red-50 focus:border-red-500' : 'border-gray-100 bg-gray-50 focus:border-blue-500 focus:bg-white'
              }`}
            />
          )}

          {/* ERREURS */}
          {(() => {
            const fieldError = (errors as Record<string, unknown>)[field.name] as
              | { message?: unknown }
              | undefined;
            if (!fieldError) return null;
            return (
              <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {String(fieldError.message ?? '')}
              </p>
            );
          })()}
        </div>
      ))}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Send className="w-4 h-4" />
            {buttonText}
          </>
        )}
      </button>
    </form>
  );
};

// Petit helper pour Lucide (optionnel si tu l'importes déjà)
function AlertTriangle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
  );
}