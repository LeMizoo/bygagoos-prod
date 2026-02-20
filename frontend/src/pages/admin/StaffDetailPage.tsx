// frontend/src/pages/admin/StaffDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  User,
  UserCheck,
  UserX,
  Briefcase,
  Users,
  MapPin,
} from "lucide-react";
import { getStaffById, deleteStaff } from "../../api/adminStaff.api";

const StaffDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getStaffById(id);
        setStaff(data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching staff:", err);
        setError(err.message || "Erreur lors du chargement");
        setStaff(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!id || !staff) return;

    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer ${staff.firstName} ${staff.lastName} ?`,
      )
    ) {
      try {
        await deleteStaff(id);
        navigate("/admin/staff");
      } catch (error: any) {
        console.error("Error deleting staff:", error);
        alert(`Erreur lors de la suppression: ${error.message}`);
      }
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

  if (error || !staff) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Erreur</h2>
          <p className="text-red-600">{error || "Membre non trouvé"}</p>
          <Link
            to="/admin/staff"
            className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const getDisplayName = () => {
    return (
      staff.name ||
      staff.displayName ||
      `${staff.firstName || ""} ${staff.lastName || ""}`.trim() ||
      "Nom inconnu"
    );
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      FOUNDER: "bg-purple-100 text-purple-800",
      INSPIRATION: "bg-pink-100 text-pink-800",
      PRODUCTION: "bg-blue-100 text-blue-800",
      CREATION: "bg-green-100 text-green-800",
      ADMIN_INSPIRATION: "bg-pink-100 text-pink-800",
      ADMIN_PRODUCTION: "bg-blue-100 text-blue-800",
      ADMIN_COMMUNICATION: "bg-green-100 text-green-800",
      SUPER_ADMIN: "bg-purple-100 text-purple-800",
      ARTISAN: "bg-yellow-100 text-yellow-800",
      USER: "bg-gray-100 text-gray-800",
      ADMIN: "bg-blue-100 text-blue-800",
      STAFF: "bg-gray-100 text-gray-800",
      MANAGER: "bg-indigo-100 text-indigo-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* En-tête avec actions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/staff"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Fiche du personnel
            </h1>
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/admin/staff/edit/${staff._id}`}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* Carte principale */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {staff.avatar ? (
                  <img
                    src={staff.avatar}
                    alt={getDisplayName()}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-gray-400" />
                )}
              </div>
            </div>

            {/* Informations */}
            <div className="flex-1">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {getDisplayName()}
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(staff.role)}`}
                  >
                    {staff.role.replace(/_/g, " ")}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      staff.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {staff.isActive ? "Actif" : "Inactif"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations personnelles */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    INFORMATIONS PERSONNELLES
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="text-gray-900 font-medium">
                          {staff.email}
                        </div>
                      </div>
                    </div>
                    {staff.phone && (
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">Téléphone</div>
                          <div className="text-gray-900 font-medium">
                            {staff.phone}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500">
                          Membre depuis
                        </div>
                        <div className="text-gray-900 font-medium">
                          {staff.joinedAt
                            ? new Date(staff.joinedAt).toLocaleDateString(
                                "fr-FR",
                              )
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations professionnelles */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    INFORMATIONS PROFESSIONNELLES
                  </h3>
                  <div className="space-y-4">
                    {staff.department && (
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">
                            Département
                          </div>
                          <div className="text-gray-900 font-medium">
                            {staff.department}
                          </div>
                        </div>
                      </div>
                    )}
                    {staff.position && (
                      <div>
                        <div className="text-sm text-gray-500">Poste</div>
                        <div className="text-gray-900 font-medium">
                          {staff.position}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-gray-500">Statut</div>
                      <div className="flex items-center">
                        {staff.isActive ? (
                          <>
                            <UserCheck className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-green-600 font-medium">
                              Actif
                            </span>
                          </>
                        ) : (
                          <>
                            <UserX className="h-4 w-4 text-red-500 mr-2" />
                            <span className="text-red-600 font-medium">
                              Inactif
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description et notes */}
      {(staff.description || staff.notes) && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Description & Notes
          </h3>
          <div className="space-y-6">
            {staff.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Description
                </h4>
                <p className="text-gray-700 whitespace-pre-line">
                  {staff.description}
                </p>
              </div>
            )}
            {staff.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Notes internes
                </h4>
                <p className="text-gray-700 whitespace-pre-line">
                  {staff.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Métadonnées */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm text-gray-500 flex flex-wrap justify-between items-center">
          <div className="flex items-center">
            <span className="mr-4">ID: {staff._id}</span>
            {staff.user && <span>Compte utilisateur: {staff.user.email}</span>}
          </div>
          <div>
            Créé le:{" "}
            {staff.createdAt
              ? new Date(staff.createdAt).toLocaleDateString("fr-FR")
              : "N/A"}
            {staff.updatedAt && staff.updatedAt !== staff.createdAt && (
              <span className="ml-4">
                Modifié le:{" "}
                {new Date(staff.updatedAt).toLocaleDateString("fr-FR")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
        <Link
          to="/admin/staff"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste du personnel
        </Link>
        <div className="text-sm text-gray-500">
          Dernière mise à jour:{" "}
          {staff.updatedAt
            ? new Date(staff.updatedAt).toLocaleDateString("fr-FR")
            : "N/A"}
        </div>
      </div>
    </div>
  );
};

export default StaffDetailPage;
