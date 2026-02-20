// frontend/src/pages/admin/AdminStaffPage.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import StaffTable from "../../components/admin/StaffTable";
import {
  getAllStaff,
  deleteStaff,
  toggleStaffStatus,
  type StaffMember,
} from "../../api/adminStaff.api";
import toast from "react-hot-toast";
import { PlusCircle, RefreshCw, Users, UserCheck, UserX } from "lucide-react";

const AdminStaffPage: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    console.log("🔍 AdminStaffPage mounted", {
      isAuthenticated,
      userRole: user?.role,
      hasToken: !!token,
    });

    if (!isAuthenticated || !token) {
      console.log("❌ Not authenticated, skipping staff fetch");
      setIsLoading(false);
      setError("Non authentifié");
      return;
    }

    loadStaff();
  }, [isAuthenticated, token]);

  const loadStaff = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("📡 Loading staff...");
      const data = await getAllStaff();

      console.log("✅ Staff data received:", data);

      setStaff(data);
      if (data.length > 0) {
        toast.success(
          `${data.length} membre${data.length > 1 ? "s" : ""} chargé${data.length > 1 ? "s" : ""}`,
        );
      }
    } catch (err: any) {
      const errorMessage = err.message || "Erreur de chargement du personnel";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("❌ Error loading staff:", err);

      setStaff([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer ce membre ? Cette action est irréversible.",
      )
    ) {
      return;
    }

    try {
      await deleteStaff(id);

      setStaff((prevStaff) => {
        const updatedStaff = prevStaff.filter((member) => member._id !== id);
        console.log("After deletion, staff count:", updatedStaff.length);
        return updatedStaff;
      });

      toast.success("Membre supprimé avec succès");
    } catch (err: any) {
      toast.error(err.message || "Erreur de suppression");
      console.error("Error deleting staff:", err);
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const updatedMember = await toggleStaffStatus(id, isActive);

      setStaff((prevStaff) =>
        prevStaff.map((member) =>
          member._id === id
            ? { ...member, ...updatedMember, isActive: updatedMember.isActive }
            : member,
        ),
      );

      toast.success(
        `Statut ${updatedMember.isActive ? "activé" : "désactivé"}`,
      );
    } catch (err: any) {
      toast.error(err.message || "Erreur de mise à jour du statut");
      console.error("Error toggling staff status:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Chargement des membres...</span>
      </div>
    );
  }

  if (error && staff.length === 0 && isAuthenticated) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <h3 className="text-lg font-semibold">Erreur de chargement</h3>
          <p className="mt-2">{error}</p>
        </div>
        <button
          onClick={loadStaff}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <div className="text-yellow-600 mb-4">
          <h3 className="text-lg font-semibold">Accès non autorisé</h3>
          <p className="mt-2">
            Vous devez être connecté pour accéder à cette page
          </p>
        </div>
        <Link
          to="/auth/login"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  const activeStaff = staff.filter((m) => m.isActive).length;
  const inactiveStaff = staff.filter((m) => !m.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion du Personnel
          </h1>
          <p className="text-gray-600 mt-1">
            {staff.length} membre{staff.length !== 1 ? "s" : ""} de l'équipe
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadStaff}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "Chargement..." : "Actualiser"}
          </button>
          <Link
            to="/admin/staff/create"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Ajouter un membre
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total membres</p>
              <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Membres actifs</p>
              <p className="text-2xl font-bold text-green-600">{activeStaff}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Membres inactifs</p>
              <p className="text-2xl font-bold text-red-600">{inactiveStaff}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Liste des membres
            </h2>
            <div className="text-sm text-gray-500">
              {activeStaff} actif{activeStaff !== 1 ? "s" : ""} •{" "}
              {inactiveStaff} inactif{inactiveStaff !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {error && staff.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-700 text-sm">
              ⚠️ Note: {error} (affichage des données existantes)
            </p>
          </div>
        )}

        {staff.length > 0 ? (
          <StaffTable
            staff={staff}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun membre trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par ajouter votre premier membre de l'équipe
            </p>
            <Link
              to="/admin/staff/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Ajouter le premier membre
            </Link>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500 mt-4 bg-blue-50 p-4 rounded-lg">
        <p className="font-medium mb-1">💡 Astuces :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Cliquez sur le statut pour activer/désactiver un membre</li>
          <li>Cliquez sur l'icône 👁️ pour voir les détails complets</li>
          <li>Cliquez sur l'icône ✏️ pour modifier un membre</li>
          <li>Les modifications sont immédiates</li>
          <li>Les membres inactifs ne peuvent pas se connecter</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminStaffPage;
