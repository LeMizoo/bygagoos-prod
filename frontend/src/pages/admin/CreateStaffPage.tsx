// frontend/src/pages/admin/CreateStaffPage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
// 🔥 CORRECTION: Importer l'objet API par défaut
import adminStaffApi, { StaffApiError } from "../../api/adminStaff.api";
import { StaffRole, StaffCategory } from "../../types/staff";
import { useAuthStore } from "../../stores/authStore";
import { UserRole, canCreate } from "../../types/roles";
import { InlineError } from "../../components/ui/InlineError";
import toast from "react-hot-toast";
import dev from '../../utils/devLogger';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: StaffRole;
  department: string;
  position: string;
  description: string;
  notes: string;
  isActive: boolean;
  category?: StaffCategory;
}

const CreateStaffPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "STAFF",
    department: "PRODUCTION",
    position: "",
    description: "",
    notes: "",
    isActive: true,
    category: "PRODUCTION",
  });

  // 🔥 Vérifier les permissions
  const userRole = user?.role as UserRole | undefined;
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
  const canCreateStaff = userRole ? canCreate(userRole, 'staff') || isSuperAdmin : false;

  // Rediriger si pas de permission
  useEffect(() => {
    if (!canCreateStaff) {
      toast.error("Vous n'avez pas les permissions nécessaires pour créer un membre");
      navigate("/admin/staff");
    }
  }, [canCreateStaff, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation côté client
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setFormError("Le prénom et le nom sont requis");
      return;
    }

    if (!formData.email.trim()) {
      setFormError("L'email est requis");
      return;
    }

    // Validation simple de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError("Format d'email invalide");
      return;
    }

    setLoading(true);

    try {
      // Préparer les données pour l'API
      const staffData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        displayName: `${formData.firstName} ${formData.lastName}`.trim(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        role: formData.role,
        department: formData.department,
        position: formData.position || undefined,
        description: formData.description || undefined,
        notes: formData.notes || undefined,
        isActive: formData.isActive,
        active: formData.isActive,
        category: formData.category,
      };

      // 🔥 CORRECTION: Utiliser adminStaffApi.create()
      const newStaff = await adminStaffApi.create(staffData);
      
      toast.success(`Membre ${newStaff.firstName} ${newStaff.lastName} créé avec succès`);
      navigate("/admin/staff");
    } catch (error: any) {
      dev.error("Error creating staff:", error);
      
      if (error instanceof StaffApiError) {
        if (error.status === 400) {
          setFormError(`Données invalides: ${error.message}`);
        } else if (error.status === 409) {
          setFormError("Un membre avec cet email existe déjà");
        } else {
          setFormError(`Erreur lors de la création: ${error.message}`);
        }
      } else {
        setFormError(`Erreur lors de la création: ${error.message || "Veuillez vérifier les données"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    // Effacer l'erreur quand l'utilisateur modifie un champ
    if (formError) setFormError(null);
  };

  // Si pas de permission, ne pas afficher le formulaire
  if (!canCreateStaff) {
    return null; // Ou un message d'erreur
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/admin/staff")}
              className="flex items-center text-gray-600 hover:text-gray-900"
              aria-label="Retour à la liste"
              title="Retour"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Créer un nouveau membre
            </h1>
          </div>
        </div>
        <p className="text-gray-600">Ajouter un nouveau membre à l'équipe</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Message d'erreur du formulaire */}
        {formError && (
          <InlineError 
            message={formError} 
            type="error"
          />
        )}

        {/* Informations de base */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Informations personnelles
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Jean"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Dupont"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="jean.dupont@exemple.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+33 6 12 34 56 78"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Rôle *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="PRODUCTION">Production</option>
                <option value="CREATION">Création</option>
                <option value="INSPIRATION">Inspiration</option>
                <option value="ARTISAN">Artisan</option>
                <option value="MANAGER">Manager</option>
                <option value="FOUNDER">Fondateur</option>
                <option value="ADMIN_INSPIRATION">Admin Inspiration</option>
                <option value="ADMIN_PRODUCTION">Admin Production</option>
                <option value="ADMIN_COMMUNICATION">Admin Communication</option>
                <option value="USER">Utilisateur</option>
              </select>
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                Département *
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="PRODUCTION">Production</option>
                <option value="CREATION">Création</option>
                <option value="INSPIRATION">Inspiration</option>
                <option value="COMMUNICATION">Communication</option>
                <option value="ADMINISTRATION">Administration</option>
                <option value="LOGISTIQUE">Logistique</option>
                <option value="SALES">Ventes</option>
                <option value="MANAGEMENT">Management</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="PRODUCTION">Production</option>
                <option value="FAMILY">Famille</option>
              </select>
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                Poste
              </label>
              <input
                id="position"
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="Ex: Artisan Sérigraphe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700">Membre actif</span>
            </label>
          </div>
        </div>

        {/* Description et notes */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Description & Notes
          </h2>

          <div className="space-y-6">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Description du membre du staff..."
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes internes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Notes internes..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/admin/staff")}
            className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            title="Annuler"
            aria-label="Annuler"
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Créer"
            aria-label="Créer"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Création en cours..." : "Créer le membre"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateStaffPage;