// frontend/src/pages/admin/SettingsPageEnhanced.tsx

import React, { useState, useEffect } from "react";
import { 
  Settings, Mail, ShieldCheck, Save, RefreshCw,
  FileText, Layout, Plus, Eye, 
  Zap, History, Globe, Terminal, 
  Lock, Upload,
  X, Loader
} from "lucide-react";
import toast from "react-hot-toast";
import { settingsApi, EmailTemplate, SystemSettings } from "../../api/settingsApi";
import TemplateEditor from "../../components/admin/TemplateEditor";

// Interfaces
interface NavTabProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

interface ToggleItemProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

interface TemplateListItemProps {
  template: EmailTemplate;
  onSelect: () => void;
  onToggle: () => void;
}

// --- COMPOSANT PRINCIPAL ---
export default function SettingsPageEnhanced() {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Templates
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);

  // System Settings
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [tempSettings, setTempSettings] = useState<Partial<SystemSettings>>({});

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
    loadSystemSettings();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await settingsApi.getAllTemplates();
      if (response.data.success) {
        setTemplates(response.data.data);
      }
    } catch (error: unknown) {
      console.error('Error loading templates:', error);
      toast.error('Erreur lors du chargement des templates');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSystemSettings = async () => {
    try {
      const response = await settingsApi.getSystemSettings();
      if (response.data.success) {
        setSystemSettings(response.data.data);
        setTempSettings(response.data.data);
      }
    } catch (error: unknown) {
      console.error('Error loading system settings:', error);
    }
  };

  const handleSaveSystemSettings = async () => {
    try {
      setIsSaving(true);
      await settingsApi.updateSystemSettings(tempSettings);
      setSystemSettings({ ...systemSettings, ...tempSettings } as SystemSettings);
      toast.success('Paramètres système enregistrés');
    } catch (error: unknown) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateEditor(true);
    setShowNewTemplateForm(false);
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setShowNewTemplateForm(true);
    setShowTemplateEditor(true);
  };

  const handleTemplateClose = () => {
    setShowTemplateEditor(false);
    setShowNewTemplateForm(false);
    setSelectedTemplate(null);
    loadTemplates();
  };

  const handleToggleTemplate = async (template: EmailTemplate) => {
    try {
      await settingsApi.toggleTemplateStatus(template._id);
      toast.success(`Template ${template.isActive ? 'désactivé' : 'activé'}`);
      loadTemplates();
    } catch (error: unknown) {
      toast.error('Erreur lors de la modification');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 p-4 font-sans text-gray-900 bg-white/50">
      
      {/* HEADER FLOTTANT */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border border-gray-100 p-4 flex flex-col md:flex-row items-center justify-between rounded-2xl shadow-sm mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Configuration Maître</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ByGagoos System v2.0</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            type="button"
            title="Visualiser le site public"
            aria-label="Voir le site"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
          >
            <Eye className="w-4 h-4" /> Voir le site
          </button>
          <button 
            type="button"
            onClick={handleSaveSystemSettings}
            disabled={isSaving}
            title="Enregistrer tous les changements"
            aria-label="Sauvegarder la configuration"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Sauvegarder
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        
        {/* NAVIGATION LATÉRALE */}
        <aside className="space-y-1">
          <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center lg:text-left">Contenu & Look</p>
          <NavTab active={activeTab === "general"} onClick={() => setActiveTab("general")} icon={<Globe className="w-4 h-4"/>} label="Global & SEO" />
          <NavTab active={activeTab === "pages"} onClick={() => setActiveTab("pages")} icon={<Layout className="w-4 h-4"/>} label="Gestion des Pages" />
          <NavTab active={activeTab === "forms"} onClick={() => setActiveTab("forms")} icon={<FileText className="w-4 h-4"/>} label="Formulaires" />
          
          <div className="my-6 border-t border-gray-100 pt-6">
            <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center lg:text-left">Automatisation</p>
            <NavTab active={activeTab === "automation"} onClick={() => setActiveTab("automation")} icon={<Zap className="w-4 h-4"/>} label="Workflows" />
            <NavTab active={activeTab === "templates"} onClick={() => setActiveTab("templates")} icon={<Mail className="w-4 h-4"/>} label="Templates Email" />
          </div>

          <div className="my-6 border-t border-gray-100 pt-6">
            <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center lg:text-left">Système</p>
            <NavTab active={activeTab === "api"} onClick={() => setActiveTab("api")} icon={<Terminal className="w-4 h-4"/>} label="API & Sécurité" />
            <NavTab active={activeTab === "logs"} onClick={() => setActiveTab("logs")} icon={<History className="w-4 h-4"/>} label="Logs d'audit" />
          </div>
        </aside>

        {/* ZONE DE TRAVAIL */}
        <main className="space-y-6 min-h-[600px]">
          
          {/* 1. GLOBAL & SEO */}
          {activeTab === "general" && systemSettings && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <Section title="Identité Visuelle">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Logo Plateforme</label>
                    <label 
                      title="Cliquez pour téléverser un logo"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:bg-gray-50 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-blue-500"
                    >
                      <Upload className="w-6 h-6 text-gray-300 mb-2" />
                      <p className="text-xs text-gray-400 font-medium">PNG ou SVG (Max 2MB)</p>
                      <input type="file" className="hidden" accept="image/*" aria-label="Choisir un fichier de logo" />
                    </label>
                  </div>
                  <div className="space-y-4">
                    <InputGroup 
                      id="primary-color" 
                      label="Couleur Primaire" 
                      type="color" 
                      value={tempSettings.primaryColor || ''} 
                      onChange={(v: string) => setTempSettings(prev => ({ ...prev, primaryColor: v }))}
                    />
                    <InputGroup 
                      id="secondary-color" 
                      label="Couleur Secondaire" 
                      type="color" 
                      value={tempSettings.secondaryColor || ''} 
                      onChange={(v: string) => setTempSettings(prev => ({ ...prev, secondaryColor: v }))}
                    />
                  </div>
                </div>
              </Section>
              <Section title="SEO Engine">
                <InputGroup 
                  id="site-title" 
                  label="Titre du Site" 
                  value={tempSettings.siteTitle || ''} 
                  onChange={(v: string) => setTempSettings(prev => ({ ...prev, siteTitle: v }))}
                />
                <div className="space-y-2 mt-4">
                  <label htmlFor="site-desc" className="text-xs font-bold text-gray-500 uppercase">Description Site</label>
                  <textarea 
                    id="site-desc"
                    value={tempSettings.siteDescription || ''}
                    onChange={(e) => setTempSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                    className="w-full border-2 border-gray-100 rounded-xl p-3 bg-gray-50 focus:bg-white focus:border-blue-600 outline-none transition-all text-sm h-24" 
                  />
                </div>
              </Section>
            </div>
          )}

          {/* 2. GESTION DES PAGES */}
          {activeTab === "pages" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Structure du site</h2>
                <button 
                  type="button"
                  title="Créer une nouvelle page"
                  aria-label="Ajouter une page"
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-md shadow-green-100"
                >
                  <Plus className="w-4 h-4" /> Nouvelle Page
                </button>
              </div>
              <Section title="Prochainement">
                <p className="text-gray-500">La gestion des pages sera disponible bientôt</p>
              </Section>
            </div>
          )}

          {/* 3. FORMULAIRES */}
          {activeTab === "forms" && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <Section title="Éditeur de Formulaire : Devis Sérigraphie">
                <p className="text-gray-500">Les formulaires seront bientôt éditables</p>
              </Section>
            </div>
          )}

          {/* 4. AUTOMATISATION */}
          {activeTab === "automation" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <Section title="Workflows">
                <p className="text-gray-500">La gestion des workflows sera disponible bientôt</p>
              </Section>
            </div>
          )}

          {/* 5. TEMPLATES EMAIL */}
          {activeTab === "templates" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              {!showTemplateEditor ? (
                <>
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-gray-900">Bibliothèque de Communication</h2>
                    <button 
                      type="button"
                      onClick={handleNewTemplate}
                      title="Nouveau template d'email"
                      aria-label="Créer un template"
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                    >
                      <Plus className="w-4 h-4" /> Nouveau Template
                    </button>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="w-6 h-6 text-blue-600 animate-spin" />
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-bold">Aucun template créé</p>
                      <p className="text-sm text-gray-400 mb-4">Commencez par créer votre premier template</p>
                      <button
                        onClick={handleNewTemplate}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold"
                      >
                        <Plus className="w-4 h-4" /> Créer un template
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {templates.map(template => (
                        <TemplateListItemEnhanced
                          key={template._id}
                          template={template}
                          onSelect={() => handleTemplateSelect(template)}
                          onToggle={() => handleToggleTemplate(template)}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Éditeur de Template</h3>
                    <button
                      onClick={handleTemplateClose}
                      title="Fermer l'éditeur"
                      aria-label="Fermer l'éditeur de template"
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                  <TemplateEditor 
                    template={selectedTemplate} 
                    onSave={handleTemplateClose}
                    onClose={handleTemplateClose}
                  />
                </div>
              )}
            </div>
          )}

          {/* 6. API & SÉCURITÉ */}
          {activeTab === "api" && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <Section title="Clés & Maintenance">
                <ToggleItem 
                  icon={<ShieldCheck className="text-amber-500 w-5 h-5" />} 
                  label="Mode Maintenance" 
                  description="Coupe l'accès public au site."
                  checked={tempSettings.maintenanceMode || false}
                  onChange={(v: boolean) => setTempSettings(prev => ({ ...prev, maintenanceMode: v }))}
                />
                <div className="p-4 bg-gray-900 rounded-2xl mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-blue-400 uppercase">Endpoint Webhook MVola</span>
                    <Lock className="w-3 h-3 text-gray-500" />
                  </div>
                  <code className="text-[11px] text-gray-300 font-mono break-all">https://api.bygagoos.com/v1/payments/mvola/callback</code>
                </div>
              </Section>
            </div>
          )}

          {/* 7. LOGS */}
          {activeTab === "logs" && (
            <Section title="Historique d'Audit">
              <p className="text-gray-500">Les logs seront disponibles bientôt</p>
            </Section>
          )}

        </main>
      </div>
    </div>
  );
}

// ========== SOUS-COMPOSANTS ==========

function NavTab({ active, onClick, icon, label }: NavTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`Aller à la section ${label}`}
      aria-label={label}
      aria-pressed={active ? "true" : "false"}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${
        active 
          ? "bg-blue-600 text-white shadow-lg shadow-blue-100 translate-x-1" 
          : "text-gray-500 hover:bg-gray-100"
      }`}
    >
      <span className={active ? "text-white" : "text-gray-400"}>{icon}</span>
      {label}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
        <h3 className="font-black text-gray-800 tracking-tight">{title}</h3>
        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
      </div>
      <div className="p-8">{children}</div>
    </div>
  );
}

function InputGroup({ 
  label, 
  value, 
  type = "text", 
  id,
  onChange
}: { 
  label: string; 
  value: string; 
  type?: string; 
  id: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</label>
      <input 
        id={id}
        type={type} 
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full border-2 border-gray-50 rounded-xl p-3 bg-gray-50 focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-800 text-sm"
      />
    </div>
  );
}

function ToggleItem({ icon, label, description, checked, onChange }: ToggleItemProps) {
  return (
    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">{icon}</div>
        <div>
          <p className="text-sm font-black text-gray-900">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <button 
        type="button"
        onClick={() => onChange?.(!checked)}
        title={checked ? "Désactiver" : "Activer"}
        aria-label={label}
        aria-pressed={checked ? "true" : "false"}
        className={`w-12 h-6 rounded-full relative transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${checked ? 'right-1' : 'left-1'}`} />
      </button>
    </div>
  );
}

function TemplateListItemEnhanced({ template, onSelect, onToggle }: TemplateListItemProps) {
  return (
    <div 
      className={`p-4 rounded-2xl border transition-all group relative cursor-pointer ${
        template.isActive
          ? "bg-white border-blue-200 shadow-md" 
          : "bg-gray-50 border-gray-200 opacity-60 hover:opacity-100"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
            template.type === 'transactional' ? 'bg-green-100 text-green-700' : 
            template.type === 'marketing' ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-700'
          }`}>
            {template.type}
          </span>
          <h4 className="text-sm font-black text-gray-900 mt-2">{template.name}</h4>
          <p className="text-xs text-gray-500 mt-1">Clé: <code>{template.key}</code></p>
        </div>
        <div className={`h-2.5 w-2.5 rounded-full ${template.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
      </div>
      <p className="text-xs text-gray-400 truncate italic mb-3">"{template.subject}"</p>
      
      <div className="flex gap-2 justify-end">
        <button 
          type="button"
          onClick={onSelect}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
        >
          Éditer
        </button>
        <button 
          type="button"
          onClick={onToggle}
          className={`px-3 py-1.5 text-sm border rounded-lg font-bold transition-colors ${
            template.isActive 
              ? 'border-red-200 text-red-600 hover:bg-red-50' 
              : 'border-green-200 text-green-600 hover:bg-green-50'
          }`}
        >
          {template.isActive ? 'Désactiver' : 'Activer'}
        </button>
      </div>
    </div>
  );
}