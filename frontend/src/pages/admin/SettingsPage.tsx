import React, { useState } from "react";
import { 
  Settings, Mail, ShieldCheck, Save, RefreshCw,
  FileText, Layout, Plus, Trash2, Edit3, Eye, 
  Zap, History, Globe, Terminal, Search, 
  Layers, CheckCircle2, AlertTriangle, Lock, Copy, Upload
} from "lucide-react";
import { toast } from "react-hot-toast";

// --- TYPES & INTERFACES ---
interface PageItem {
  id: number;
  title: string;
  url: string;
  status: string;
}

interface AuditLog {
  id: number;
  action: string;
  user: string;
  date: string;
  status: "success" | "warning";
}

interface NavTabProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

// --- COMPOSANT PRINCIPAL ---
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);

  // --- ÉTATS SIMULÉS ---
  const [pages] = useState<PageItem[]>([
    { id: 1, title: "Accueil", url: "/", status: "Publié" },
    { id: 2, title: "Nos Services", url: "/services", status: "Brouillon" },
    { id: 3, title: "FAQ Technique", url: "/faq", status: "Publié" }
  ]);

  const [logs] = useState<AuditLog[]>([
    { id: 1, action: "Modif. Formulaire", user: "Tovo", date: "10:15", status: "success" },
    { id: 2, action: "Config MVola", user: "Eric", date: "Hier", status: "warning" },
    { id: 3, action: "Backup Système", user: "System", date: "04:00", status: "success" },
  ]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Configuration maître enregistrée avec succès !");
    }, 1200);
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
            onClick={handleSave}
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
          {activeTab === "general" && (
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
                    <InputGroup id="primary-color" label="Couleur Primaire" type="color" defaultValue="#2563eb" />
                    <InputGroup id="secondary-color" label="Couleur Secondaire" type="color" defaultValue="#4f46e5" />
                  </div>
                </div>
              </Section>
              <Section title="SEO Engine">
                <InputGroup id="meta-title" label="Meta Title" defaultValue="ByGagoos Ink | Sérigraphie & Design" />
                <div className="space-y-2 mt-4">
                  <label htmlFor="meta-desc" className="text-xs font-bold text-gray-500 uppercase">Meta Description</label>
                  <textarea 
                    id="meta-desc"
                    className="w-full border-2 border-gray-100 rounded-xl p-3 bg-gray-50 focus:bg-white focus:border-blue-600 outline-none transition-all text-sm h-24" 
                    defaultValue="Spécialiste de la sérigraphie à Antananarivo." 
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
              <div className="grid gap-4">
                {pages.map(page => (
                  <div key={page.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-blue-300 transition-all shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50">
                        <Layout className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{page.title}</h4>
                        <p className="text-xs text-gray-400 font-mono">{page.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${page.status === 'Publié' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {page.status}
                      </span>
                      <div className="flex gap-1">
                        <button type="button" title="Modifier la page" aria-label={`Modifier ${page.title}`} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                        <button type="button" title="Supprimer la page" aria-label={`Supprimer ${page.title}`} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. FORMULAIRES */}
          {activeTab === "forms" && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <Section title="Éditeur de Formulaire : Devis Sérigraphie">
                <div className="space-y-3">
                  <FormFieldRow label="Type de Support" type="Dropdown" required />
                  <FormFieldRow label="Quantité demandée" type="Number" required />
                  <FormFieldRow label="Instructions Spéciales" type="Textarea" required={false} />
                  <button 
                    type="button"
                    title="Ajouter un champ au formulaire"
                    aria-label="Ajouter un champ personnalisé"
                    className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 font-bold text-sm hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    <Plus className="w-4 h-4" /> Ajouter un champ personnalisé
                  </button>
                </div>
              </Section>
            </div>
          )}

          {/* 4. AUTOMATISATION */}
          {activeTab === "automation" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Exécutions (24h)" value="1,284" icon={<Zap className="text-blue-500 w-5 h-5" />} change="+12%" />
                <StatCard label="Taux de succès" value="99.2%" icon={<CheckCircle2 className="text-green-500 w-5 h-5" />} />
                <StatCard label="Erreurs actives" value="3" icon={<AlertTriangle className="text-red-500 w-5 h-5" />} color="text-red-600" />
              </div>
              <Section title="Flux de Travail Actifs">
                <div className="space-y-4">
                  <WorkflowRow title="Validation Paiement MVola" trigger="Webhook: Success" action="Email Client + SMS Prod" runs="450" status="actif" />
                  <WorkflowRow title="Relance Devis Incomplet" trigger="Time: 48h sans" action="Push Mobile" runs="12" status="actif" />
                  <button 
                    type="button"
                    title="Créer un nouveau workflow"
                    aria-label="Bâtir un workflow"
                    className="w-full py-6 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-black text-sm hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/30 transition-all flex flex-col items-center gap-2 group"
                  >
                    <div className="p-3 bg-gray-50 rounded-full group-hover:bg-blue-100 transition-colors">
                      <Plus className="w-6 h-6" />
                    </div>
                    Bâtir un nouveau Workflow personnalisé
                  </button>
                </div>
              </Section>
            </div>
          )}

          {/* 5. TEMPLATES EMAIL */}
          {activeTab === "templates" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-gray-900">Bibliothèque de Communication</h2>
                <button 
                  type="button"
                  title="Nouveau template d'email"
                  aria-label="Créer un template"
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  <Plus className="w-4 h-4" /> Nouveau Template
                </button>
              </div>

              <div className="grid lg:grid-cols-[350px_1fr] gap-6">
                <div className="space-y-3">
                  <TemplateListItem title="Confirmation Commande" subject="Merci !" type="Transactionnel" active />
                  <TemplateListItem title="Relance Devis" subject="Votre projet..." type="Marketing" />
                  <TemplateListItem title="Alerte Stock Bas" subject="[ADMIN] Encre" type="Système" />
                </div>

                <Section title="Éditeur de Contenu">
                  <div className="space-y-6">
                    <InputGroup id="email-subject" label="Objet de l'email" defaultValue="Merci pour votre confiance chez ByGagoos !" />
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label htmlFor="email-body" className="text-[10px] font-black text-gray-400 uppercase">Corps du message</label>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{'{{client_name}}'}</span>
                      </div>
                      <textarea 
                        id="email-body"
                        aria-label="Corps de l'email"
                        className="w-full border-2 border-gray-50 rounded-2xl p-4 bg-gray-50 font-mono text-sm h-64 focus:bg-white focus:border-blue-600 outline-none transition-all"
                        defaultValue={`Bonjour {{client_name}},\n\nNous avons bien reçu votre commande #{{order_id}}.\nCordialement,\nByGagoos.`}
                      />
                    </div>
                  </div>
                </Section>
              </div>
            </div>
          )}

          {/* 6. API & SÉCURITÉ */}
          {activeTab === "api" && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <Section title="Clés & Maintenance">
                <ToggleItem icon={<ShieldCheck className="text-amber-500 w-5 h-5" />} label="Mode Maintenance" description="Coupe l'accès public au site." />
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
              <div className="overflow-hidden border border-gray-100 rounded-2xl">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold text-gray-700">Action</th>
                      <th className="px-6 py-4 text-left font-bold text-gray-700">User</th>
                      <th className="px-6 py-4 text-left font-bold text-gray-700">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{log.action}</td>
                        <td className="px-6 py-4 text-gray-500">{log.user}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${log.status === 'success' ? 'bg-green-500' : 'bg-amber-500'}`} />
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

        </main>
      </div>
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function NavTab({ active, onClick, icon, label }: NavTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`Aller à la section ${label}`}
      aria-label={label}
      aria-pressed={active} // Correction ici : utilise le booléen active
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

function Section({ title, children }: SectionProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
        <h3 className="font-black text-gray-800 tracking-tight">{title}</h3>
        <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
      </div>
      <div className="p-8">{children}</div>
    </div>
  );
}

function FormFieldRow({ label, type, required }: any) {
  const [isRequired, setIsRequired] = useState(required);
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all">
      <div className="flex items-center gap-4">
        <Layers className="w-5 h-5 text-gray-400" />
        <div>
          <p className="text-sm font-bold text-gray-900">{label}</p>
          <p className="text-[10px] text-gray-500 font-mono uppercase">{type}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-black text-gray-400 uppercase">Requis</span>
        <button 
          type="button"
          onClick={() => setIsRequired(!isRequired)}
          title={isRequired ? "Marquer comme optionnel" : "Rendre obligatoire"}
          aria-label={`Définir ${label} comme obligatoire`}
          aria-pressed={isRequired} // Correction ici
          className={`w-8 h-4 rounded-full relative transition-colors ${isRequired ? 'bg-blue-600' : 'bg-gray-200'}`}
        >
          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isRequired ? 'right-0.5' : 'left-0.5'}`} />
        </button>
        <button 
          type="button"
          title={`Supprimer le champ ${label}`}
          aria-label={`Supprimer ${label}`}
          className="text-gray-400 hover:text-red-500 ml-2"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function InputGroup({ label, defaultValue, type = "text", id }: any) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</label>
      <input 
        id={id}
        type={type} 
        defaultValue={defaultValue}
        className="w-full border-2 border-gray-50 rounded-xl p-3 bg-gray-50 focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-800 text-sm"
      />
    </div>
  );
}

function ToggleItem({ icon, label, description }: any) {
  const [isOn, setIsOn] = useState(false);
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
        onClick={() => setIsOn(!isOn)}
        title={isOn ? "Désactiver" : "Activer"}
        aria-label={label}
        aria-pressed={isOn} // Correction ici
        className={`w-12 h-6 rounded-full relative transition-colors ${isOn ? 'bg-blue-600' : 'bg-gray-300'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${isOn ? 'right-1' : 'left-1'}`} />
      </button>
    </div>
  );
}

function WorkflowRow({ title, trigger, action, runs, status }: any) {
  const [isActive, setIsActive] = useState(status === 'actif');
  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-xl hover:border-blue-200 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`mt-1 p-3 rounded-xl ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-100 text-gray-400'}`}>
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h4>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-md font-mono text-gray-600 uppercase italic">{trigger}</span>
              <div className="h-px w-4 bg-gray-300"></div>
              <span className="text-[10px] bg-blue-50 px-2 py-0.5 rounded-md font-mono text-blue-600 uppercase italic">{action}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-4 md:pt-0">
          <div className="text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase">Runs</p>
            <p className="text-sm font-bold text-gray-700">{runs}</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" title="Éditer le workflow" aria-label={`Modifier ${title}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Edit3 className="w-4 h-4 text-gray-400" /></button>
            <button 
              type="button"
              onClick={() => setIsActive(!isActive)}
              title={isActive ? "Mettre en pause" : "Démarrer"}
              aria-label={`Changer statut de ${title}`}
              aria-pressed={isActive} // Correction ici
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${isActive ? 'bg-green-500' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isActive ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, change, color = "text-gray-900" }: any) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        {change && <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-lg">{change}</span>}
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
    </div>
  );
}

function TemplateListItem({ title, subject, type, active = false }: any) {
  return (
    <div 
      className={`p-4 rounded-2xl border transition-all group relative cursor-pointer ${
      active 
        ? "bg-white border-blue-200 shadow-md ring-2 ring-blue-50" 
        : "bg-gray-50 border-transparent hover:bg-white hover:border-gray-200"
    }`}>
      <div className="flex justify-between items-start mb-1">
        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
          type === 'Transactionnel' ? 'bg-green-100 text-green-700' : 
          type === 'Marketing' ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-700'
        }`}>
          {type}
        </span>
        {active && <div className="h-2 w-2 rounded-full bg-blue-600 shadow-blue-400 shadow-sm"></div>}
      </div>
      <h4 className={`text-sm font-black ${active ? 'text-blue-600' : 'text-gray-900'}`}>{title}</h4>
      <p className="text-xs text-gray-500 truncate mt-1 italic">"{subject}"</p>

      <div className="mt-3 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button type="button" className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400" title="Dupliquer le template" aria-label={`Copier ${title}`}><Copy className="w-3.5 h-3.5" /></button>
        <button type="button" className="p-1.5 hover:bg-red-50 rounded-lg text-red-400" title="Supprimer le template" aria-label={`Supprimer ${title}`}><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}