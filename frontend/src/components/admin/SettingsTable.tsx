// frontend/src/components/admin/SettingsTable.tsx
import React, { useState } from "react";
import {
  Save,
  Settings as SettingsIcon,
  Globe,
  Bell,
  Shield,
  Palette,
} from "lucide-react";
import { AppSettings } from "../../api/adminSettings.api";

interface SettingsTableProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  isLoading?: boolean;
}

// Types pour les champs du formulaire
interface TextField {
  id: string;
  label: string;
  type: "text";
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  placeholder?: string;
  description?: string;
}

interface SelectField {
  id: string;
  label: string;
  type: "select";
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  options: Array<{ value: string; label: string }>;
  description?: string;
}

interface CheckboxField {
  id: string;
  label: string;
  type: "checkbox";
  icon: React.ComponentType<{ className?: string }>;
  value: boolean;
  description: string;
}

type Field = TextField | SelectField | CheckboxField;

interface Section {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: Field[];
}

const SettingsTable: React.FC<SettingsTableProps> = ({
  settings,
  onSave,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [isModified, setIsModified] = useState(false);

  const handleChange = (key: keyof AppSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
    setIsModified(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsModified(false);
  };

  const handleReset = () => {
    setFormData(settings);
    setIsModified(false);
  };

  // Sections de configuration avec types corrects
  const sections: Section[] = [
    {
      id: "general",
      title: "Général",
      icon: SettingsIcon,
      fields: [
        {
          id: "siteName",
          label: "Nom du site",
          type: "text",
          icon: Globe,
          value: formData.siteName || "",
          placeholder: "Ex: ByGagoos-Ink",
        } as TextField,
        {
          id: "language",
          label: "Langue par défaut",
          type: "select",
          icon: Globe,
          value: formData.language || "fr",
          options: [
            { value: "fr", label: "Français" },
            { value: "en", label: "English" },
            { value: "mg", label: "Malagasy" },
          ],
        } as SelectField,
      ],
    },
    {
      id: "features",
      title: "Fonctionnalités",
      icon: Bell,
      fields: [
        {
          id: "enableAnalytics",
          label: "Analytics",
          type: "checkbox",
          icon: SettingsIcon,
          value: formData.enableAnalytics || false,
          description: "Activer le suivi des statistiques",
        } as CheckboxField,
        {
          id: "enableMaintenance",
          label: "Mode maintenance",
          type: "checkbox",
          icon: SettingsIcon,
          value: formData.enableMaintenance || false,
          description: "Mettre le site en mode maintenance",
        } as CheckboxField,
      ],
    },
    {
      id: "appearance",
      title: "Apparence",
      icon: Palette,
      fields: [
        {
          id: "theme",
          label: "Thème",
          type: "select",
          icon: Palette,
          value: formData.theme || "light",
          options: [
            { value: "light", label: "Clair" },
            { value: "dark", label: "Sombre" },
            { value: "auto", label: "Auto (système)" },
          ],
        } as SelectField,
      ],
    },
    {
      id: "security",
      title: "Sécurité",
      icon: Shield,
      fields: [
        {
          id: "requireEmailVerification",
          label: "Vérification email",
          type: "checkbox",
          icon: Shield,
          value: formData.requireEmailVerification || false,
          description: "Exiger la vérification des emails",
        } as CheckboxField,
      ],
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* En-tête */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <SettingsIcon className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">
              Paramètres de l'application
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            {isModified && (
              <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                Modifications non sauvegardées
              </span>
            )}
            <button
              onClick={handleReset}
              disabled={!isModified}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                isModified
                  ? "text-gray-700 bg-gray-100 hover:bg-gray-200"
                  : "text-gray-400 bg-gray-50 cursor-not-allowed"
              }`}
            >
              Annuler
            </button>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Configurez les paramètres de votre application. Les changements sont
          appliqués immédiatement après sauvegarde.
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit}>
        <div className="divide-y divide-gray-200">
          {sections.map((section) => {
            const SectionIcon = section.icon;

            return (
              <div key={section.id} className="p-6">
                <div className="flex items-center mb-4">
                  <SectionIcon className="h-5 w-5 text-gray-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">
                    {section.title}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.fields.map((field) => {
                    const FieldIcon = field.icon;

                    return (
                      <div key={field.id} className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <FieldIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {field.label}
                        </label>

                        {field.type === "text" && (
                          <input
                            type="text"
                            value={field.value}
                            onChange={(e) =>
                              handleChange(
                                field.id as keyof AppSettings,
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={
                              "placeholder" in field ? field.placeholder : ""
                            }
                          />
                        )}

                        {field.type === "select" && (
                          <select
                            value={field.value}
                            onChange={(e) =>
                              handleChange(
                                field.id as keyof AppSettings,
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {"options" in field &&
                              field.options.map(
                                (option: { value: string; label: string }) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ),
                              )}
                          </select>
                        )}

                        {field.type === "checkbox" && (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={field.id}
                              checked={field.value}
                              onChange={(e) =>
                                handleChange(
                                  field.id as keyof AppSettings,
                                  e.target.checked,
                                )
                              }
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label
                              htmlFor={field.id}
                              className="ml-2 text-sm text-gray-600"
                            >
                              {"description" in field && field.description}
                            </label>
                          </div>
                        )}

                        {"description" in field &&
                          field.type !== "checkbox" &&
                          field.description && (
                            <p className="text-xs text-gray-500">
                              {field.description}
                            </p>
                          )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Tous les paramètres sont automatiquement sauvegardés.
            </div>
            <button
              type="submit"
              disabled={!isModified || isLoading}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                !isModified || isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder les modifications
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SettingsTable;
