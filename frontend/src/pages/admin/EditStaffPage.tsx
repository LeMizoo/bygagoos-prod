// frontend/src/pages/admin/EditStaffPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import { getStaffById, updateStaff } from "../../api/adminStaff.api";
import { StaffRole, StaffCategory } from "../../types/staff";

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
}

export default function EditStaffPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  });

  useEffect(() => {
    if (id) {
      fetchStaff(id);
    }
  }, [id]);

  const fetchStaff = async (staffId: string) => {
    try {
      setLoading(true);
      const data = await getStaffById(staffId);

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
      });
    } catch (err) {
      console.error("Error fetching staff:", err);
      alert("Erreur lors du chargement du membre");
      navigate("/admin/staff");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

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
      };

      await updateStaff(id, updateData);
      navigate(`/admin/staff/${id}`);
    } catch (err: any) {
      alert(
        `Erreur lors de la mise à jour: ${err.message || "Veuillez vérifier les données"}`,
      );
      console.error(err);
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
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Chargement...</span>
      </div>
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
        {/* Informations de base */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Informations personnelles
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rôle *
              </label>
              <select
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Département *
              </label>
              <select
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poste
              </label>
              <input
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Description du membre du staff..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes internes
              </label>
              <textarea
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
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
