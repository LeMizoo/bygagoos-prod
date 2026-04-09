// frontend/src/components/admin/FormBuilder.tsx

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Save, AlertCircle } from 'lucide-react';
import { FormConfig, FormField, updateFormConfig, getFormConfig } from '../../api/adminForms.api';
import { Button, Input, Select, Card, LoadingSpinner } from '../ui';

interface FormBuilderProps {
  slug: string;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Texte court' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Téléphone' },
  { value: 'number', label: 'Nombre' },
  { value: 'textarea', label: 'Texte long' },
  { value: 'dropdown', label: 'Liste déroulante' },
];

export const FormBuilder: React.FC<FormBuilderProps> = ({ slug }) => {
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await getFormConfig(slug);
        setConfig(data);
      } catch (err) {
        setConfig({
          slug,
          title: `Nouveau formulaire (${slug})`,
          fields: [],
          isActive: true
        });
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, [slug]);

  const addField = () => {
    if (!config) return;
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: 'Nouveau champ',
      type: 'text',
      required: false,
      order: config.fields.length,
      placeholder: ''
    };
    setConfig({ ...config, fields: [...config.fields, newField] });
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    if (!config) return;
    const newFields = config.fields.map(f => f.id === id ? { ...f, ...updates } : f);
    setConfig({ ...config, fields: newFields });
  };

  const removeField = (id: string) => {
    if (!config) return;
    setConfig({ ...config, fields: config.fields.filter(f => f.id !== id) });
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setError(null);
    try {
      await updateFormConfig(slug, config);
      alert('Configuration enregistrée avec succès !');
    } catch (err) {
      setError("Erreur lors de l'enregistrement de la configuration.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Éditeur : {config?.title}</h2>
            <p className="text-sm text-gray-500">Identifiant technique (slug) : {slug}</p>
          </div>
          <Button onClick={handleSave} disabled={saving} variant="default">
            {saving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4 mr-2" />}
            Enregistrer les modifications
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 flex items-center border border-red-200">
            <AlertCircle className="w-4 h-4 mr-2" /> {error}
          </div>
        )}

        <div className="space-y-4">
          {config?.fields.sort((a, b) => a.order - b.order).map((field) => (
            <div key={field.id} className="flex gap-4 p-4 border rounded-lg bg-gray-50 items-start group relative">
              <div className="mt-2 text-gray-400 cursor-grab active:cursor-grabbing">
                <GripVertical className="w-5 h-5" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
                <Input
                  label="Nom du champ (Label)"
                  value={field.label}
                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                />
                <Select
                  label="Type de donnée"
                  options={FIELD_TYPES}
                  value={field.type}
                  onChange={(val) => updateField(field.id, { type: val as any })}
                />
                <Input
                  label="Texte d'aide (Placeholder)"
                  value={field.placeholder || ''}
                  onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                />
                <div className="flex items-center mt-8 gap-2">
                   <input
                    id={`required-${field.id}`}
                    type="checkbox"
                    title="Champ requis"
                    checked={field.required}
                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`required-${field.id}`} className="text-sm font-medium text-gray-700">
                    Obligatoire
                  </label>
                </div>
              </div>

              <Button 
                variant="danger" 
                className="mt-7 p-2"
                onClick={() => removeField(field.id)}
                title="Supprimer ce champ"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button 
          onClick={addField} 
          variant="outline" 
          className="w-full mt-6 border-dashed border-2 py-8 hover:bg-white hover:border-blue-400 transition-all"
        >
          <Plus className="w-5 h-5 mr-2" /> Ajouter un nouveau champ au formulaire
        </Button>
      </Card>
    </div>
  );
};