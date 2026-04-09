// frontend/src/components/admin/TemplateEditor.tsx

import React, { useState, useEffect } from 'react';
import { Eye, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { settingsApi, EmailTemplate } from '../../api/settingsApi';

interface TemplateEditorProps {
  template: EmailTemplate | null;
  onSave?: () => void;
  onClose?: () => void;
  isReadOnly?: boolean;
}

type TemplateType = 'transactional' | 'marketing';

type TemplateForm = {
  key: string;
  name: string;
  subject: string;
  body: string;
  type: TemplateType;
  variables: string[];
  isActive: boolean;
};

// Type for API error response
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function TemplateEditor({
  template,
  onSave,
  onClose,
  isReadOnly = false
}: TemplateEditorProps) {

  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showVariables, setShowVariables] = useState(false);

  const [form, setForm] = useState<TemplateForm>({
    key: '',
    name: '',
    subject: '',
    body: '',
    type: 'transactional',
    variables: [],
    isActive: true
  });

  // ======================
  // HYDRATE FORM
  // ======================
  useEffect(() => {
    if (!template) return;

    setForm({
      key: template.key,
      name: template.name,
      subject: template.subject,
      body: template.body,

      // FIX SAFE TYPE (ignore "system")
      type:
        template.type === 'marketing'
          ? 'marketing'
          : 'transactional',

      variables: template.variables || [],
      isActive: template.isActive
    });
  }, [template]);

  // ======================
  // ERROR HANDLER
  // ======================
  const getErrorMessage = (err: unknown): string => {
    if (!err || typeof err !== 'object') return 'Une erreur est survenue';

    const maybe = err as ApiError;
    const message =
      maybe?.response?.data?.message ||
      maybe?.message;

    return message || 'Une erreur est survenue';
  };

  // ======================
  // SAVE
  // ======================
  const handleSave = async () => {
    if (!form.key || !form.name || !form.subject || !form.body) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSaving(true);

    try {
      if (template) {
        await settingsApi.updateTemplate(template._id, form);
        toast.success('Template mis à jour avec succès');
      } else {
        await settingsApi.createTemplate(form);
        toast.success('Template créé avec succès');
      }

      onSave?.();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  // ======================
  // DELETE
  // ======================
  const handleDelete = async () => {
    if (!template) return;
    if (!window.confirm('Supprimer ce template ?')) return;

    try {
      await settingsApi.deleteTemplate(template._id);
      toast.success('Template supprimé');
      onClose?.();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // ======================
  // INSERT VARIABLE
  // ======================
  const handleVariableInsert = (variable: string) => {
    const textarea = document.getElementById(
      'template-body'
    ) as HTMLTextAreaElement | null;

    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newBody =
      form.body.slice(0, start) +
      `{{${variable}}}` +
      form.body.slice(end);

    setForm(prev => ({ ...prev, body: newBody }));

    setTimeout(() => {
      textarea.focus();
      const pos = start + variable.length + 4;
      textarea.setSelectionRange(pos, pos);
    }, 0);
  };

  const extractedVariables =
    form.body.match(/\{\{(\w+)\}\}/g)?.map(v => v.replace(/[{}]/g, '')) || [];

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">
          {template ? `Éditer: ${template.name}` : 'Nouveau Template'}
        </h3>

        <div className="flex gap-2">

          {/* VARIABLES */}
          {template && (
            <button
              type="button"
              onClick={() => setShowVariables(v => !v)}
              aria-label={showVariables ? "Fermer les variables" : "Afficher les variables"}
              aria-expanded={showVariables}
              className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          )}

          {/* PREVIEW */}
          <button
            type="button"
            onClick={() => setShowPreview(v => !v)}
            aria-label={showPreview ? "Fermer la prévisualisation" : "Afficher la prévisualisation"}
            aria-expanded={showPreview}
            className={`p-2 rounded-lg ${
              showPreview
                ? 'bg-gray-200 text-gray-900'
                : 'hover:bg-gray-100 text-gray-400'
            }`}
          >
            <Eye className="w-5 h-5" />
          </button>

        </div>
      </div>

      {/* VARIABLES PANEL */}
      {showVariables && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-900 mb-3">
            Variables disponibles
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {form.variables.map(variable => (
              <button
                key={variable}
                type="button"
                onClick={() => handleVariableInsert(variable)}
                className="px-3 py-2 text-sm font-mono bg-white border rounded text-blue-600 hover:bg-blue-100"
              >
                {`{{${variable}}}`}
              </button>
            ))}
          </div>

          {extractedVariables.length > 0 && (
            <p className="text-xs text-blue-700 mt-3 italic">
              Détectées: {extractedVariables.join(', ')}
            </p>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">

        {/* FORM */}
        <div className="space-y-4">

          <div>
            <label htmlFor="template-name" className="block text-sm font-medium text-gray-700">
              Nom du template
            </label>
            <input
              id="template-name"
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border p-2 rounded"
              placeholder="Ex: Email de bienvenue"
            />
          </div>

          <div>
            <label htmlFor="template-subject" className="block text-sm font-medium text-gray-700">
              Sujet
            </label>
            <input
              id="template-subject"
              type="text"
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
              className="w-full border p-2 rounded"
              placeholder="Ex: Bienvenue sur notre plateforme"
            />
          </div>

        </div>

        {/* PREVIEW */}
        {showPreview && (
          <div className="border rounded p-4">
            <h4 className="font-semibold mb-2">Preview</h4>
            <p className="font-medium">{form.subject}</p>

            <div
              className="mt-2 text-sm"
              dangerouslySetInnerHTML={{ __html: form.body }}
            />
          </div>
        )}
      </div>

      {/* BODY */}
      <div>
        <label htmlFor="template-body" className="block text-sm font-medium mb-1 text-gray-700">
          Contenu du template
        </label>

        <textarea
          id="template-body"
          value={form.body}
          onChange={e => setForm({ ...form, body: e.target.value })}
          className="w-full border p-4 rounded h-64 font-mono text-sm"
          placeholder="Écrivez votre template ici... Utilisez {{variable}} pour insérer des variables"
          aria-label="Contenu du template email"
        />
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3">

        {!isReadOnly && (
          <>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>

            {template && (
              <button
                type="button"
                onClick={handleDelete}
                className="border border-red-400 text-red-600 p-2 rounded hover:bg-red-50"
              >
                Supprimer
              </button>
            )}
          </>
        )}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="border p-2 rounded hover:bg-gray-50"
          >
            Fermer
          </button>
        )}

      </div>
    </div>
  );
}