// frontend/src/pages/admin/EditStaffPage.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
// 🔥 CORRECTION: Importer l'objet API par défaut
import adminStaffApi, { StaffApiError } from "../../api/adminStaff.api";
import { StaffRole, StaffCategory } from "../../types/staff";
import { isValidObjectId } from "../../utils/validators";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { InlineError } from "../../components/ui/InlineError";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/authStore";
import { UserRole, canEdit } from "../../types/roles";
import dev from '../../utils/devLogger';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  role: StaffRole;
  isActive: boolean;
  description: string;
  notes: string;
  name?: string;
  displayName?: string;
  category?: StaffCategory;
  avatar?: string;
}

export default function EditStaffPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    role: "STAFF",
    isActive: true,
    description: "",
    notes: "",
    category: "PRODUCTION",
    avatar: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // 🔥 Vérifier les permissions
  const userRole = user?.role as UserRole | undefined;
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
  const canEditStaff = userRole ? canEdit(userRole, 'staff') || isSuperAdmin : false;

  useEffect(() => {
    if (!id || !isValidObjectId(id)) {
      navigate("/admin/staff");
      return;
    }

    // 🔥 Rediriger si pas de permission
    if (!canEditStaff) {
      toast.error("Vous n'avez pas les permissions nécessaires pour modifier");
      navigate(`/admin/staff/${id}`);
      return;
    }

    fetchStaff(id);
  }, [id, canEditStaff]);

  const fetchStaff = async (staffId: string) => {
    try {
      setLoading(true);
      setError(null);

      // ÉTAPE 1: Valider l'ID avant l'appel API
      if (!isValidObjectId(staffId)) {
        setError({ 
          message: "Le format de l'ID est invalide. Veuillez vérifier l'URL.", 
          status: 400 
        });
        setLoading(false);
        return;
      }

      // 🔥 CORRECTION: Utiliser adminStaffApi.getById()
      const data = await adminStaffApi.getById(staffId);

      // Extraire le prénom et nom du nom complet
      const nameParts = data.name ? data.name.split(" ") : [];
      const firstName = data.firstName || nameParts[0] || "";
      const lastName =
        data.lastName ||
        (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");

      // Déterminer le rôle en fonction des valeurs disponibles
      const role: StaffRole = (data.role as StaffRole) || "STAFF";

      setFormData({
        firstName,
        lastName,
        email: data.email || "",
        phone: data.phone || "",
        position: data.position || data.role || "",
        department: data.department || "",
        role,
        isActive:
          data.isActive !== undefined ? data.isActive : data.active !== false,
        description: data.description || "",
        notes: data.notes || "",
        name: data.name,
        displayName: data.displayName,
        category: (data.category as StaffCategory) || "PRODUCTION",
        avatar: data.avatar || "",
      });

      // Set avatar preview if exists
      if (data.avatar) {
        setAvatarPreview(data.avatar);
      }
    } catch (err) {
      dev.error("Error fetching staff:", err);
      
      if (err instanceof StaffApiError) {
        if (err.status === 404) {
          setError({ 
            message: "Le membre du personnel recherché n'existe pas.", 
            status: 404 
          });
        } else if (err.status === 400) {
          setError({ 
            message: "Requête invalide. Veuillez vérifier l'URL.", 
            status: 400 
          });
        } else if (err.status === 401 || err.status === 403) {
          setError({ 
            message: "Vous n'êtes pas autorisé à accéder à cette ressource.", 
            status: err.status 
          });
        } else {
          setError({ 
            message: err.message || "Erreur lors du chargement du membre", 
            status: err.status || 500 
          });
        }
      } else {
        setError({ 
          message: "Une erreur inattendue est survenue", 
          status: 500 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!id) {
      setFormError("ID manquant");
      return;
    }

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

    try {
      setSaving(true);
      // Préparer les données pour l'API
      const updateData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone || undefined,
        position: formData.position || undefined,
        department: formData.department,
        role: formData.role,
        isActive: formData.isActive,
        description: formData.description || undefined,
        notes: formData.notes || undefined,
        firstName: formData.firstName,
        lastName: formData.lastName,
        category: formData.category,
        avatar: formData.avatar || undefined,
      };

      // 🔥 CORRECTION: Utiliser adminStaffApi.update()
      await adminStaffApi.update(id, updateData);
      
      toast.success("Membre mis à jour avec succès");
      navigate(`/admin/staff/${id}`);
    } catch (err: any) {
      dev.error(err);
      
      if (err instanceof StaffApiError) {
        if (err.status === 400) {
          setFormError(`Données invalides: ${err.message}`);
        } else if (err.status === 404) {
          setFormError("Le membre n'existe plus. Il a peut-être été supprimé.");
        } else if (err.status === 409) {
          setFormError("Conflit: Un membre avec cet email existe peut-être déjà.");
        } else {
          setFormError(`Erreur lors de la mise à jour: ${err.message}`);
        }
      } else {
        setFormError("Une erreur inattendue est survenue lors de la mise à jour");
      }
    } finally {
      setSaving(false);
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
    // Effacer l'erreur de formulaire quand l'utilisateur modifie un champ
    if (formError) setFormError(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !id) return;

    try {
      setUploadingAvatar(true);
      // 🔥 CORRECTION: Utiliser adminStaffApi.uploadAvatar()
      const result = await adminStaffApi.uploadAvatar(id, avatarFile);
      setFormData((prev) => ({ ...prev, avatar: result.avatarUrl }));
      setAvatarFile(null);
      toast.success("Avatar mis à jour avec succès");
    } catch (error: any) {
      dev.error("Error uploading avatar:", error);
      toast.error(error.message || "Erreur lors de l'upload de l'avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Chargement...</span>
      </div>
    );
  }

  if (error) {
    const errorMessages = {
      400: {
        title: 'Requête invalide',
        message: error.message || 'L\'ID fourni n\'est pas valide.'
      },
      404: {
        title: 'Non trouvé',
        message: error.message || 'Le membre du personnel recherché n\'existe pas.'
      },
      401: {
        title: 'Non autorisé',
        message: 'Vous devez être connecté pour accéder à cette page.'
      },
      403: {
        title: 'Accès refusé',
        message: 'Vous n\'avez pas les droits nécessaires pour modifier ce membre.'
      },
      500: {
        title: 'Erreur serveur',
        message: 'Une erreur est survenue sur le serveur. Veuillez réessayer plus tard.'
      }
    };

    const errorConfig = errorMessages[error.status as keyof typeof errorMessages] || {
      title: 'Erreur',
      message: error.message
    };

    return (
      <ErrorMessage
        title={errorConfig.title}
        message={errorConfig.message}
        statusCode={error.status}
        redirectTo="/admin/staff"
        redirectDelay={5}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              to={`/admin/staff/${id}`}
              className="flex items-center text-gray-600 hover:text-gray-900"
              aria-label="Retour aux détails"
              title="Retour"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Modifier le membre du staff
            </h1>
          </div>
        </div>
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

          {/* Avatar Section */}
          <div className="mb-6">
            <label htmlFor="avatar-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Avatar
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
                    <span className="text-gray-500 text-2xl">
                      {formData.firstName.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                  onChange={handleAvatarChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  aria-label="Choisir une image d'avatar"
                  title="Choisir une image"
                />
                {avatarFile && (
                  <div className="mt-2 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Uploader l'avatar"
                      aria-label="Uploader l'avatar"
                    >
                      {uploadingAvatar ? "Upload..." : "Uploader"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(formData.avatar || "");
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400"
                      title="Annuler"
                      aria-label="Annuler"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

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
          <Link
            to={`/admin/staff/${id}`}
            className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            title="Annuler"
            aria-label="Annuler"
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Enregistrer"
            aria-label="Enregistrer"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}