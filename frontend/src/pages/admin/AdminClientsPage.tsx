// frontend/src/pages/admin/AdminClientsPage.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  PlusCircle,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  Edit,
  Trash2,
} from "lucide-react";

import { useAuthStore } from "../../stores/authStore";
import adminClientsApi, { Client } from "../../api/adminClients.api";

import ClientsTable from "../../components/admin/ClientsTable"; // À créer comme StaffTable

const AdminClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setIsLoading(false);
      setError("Non authentifié");
      return;
    }
    loadClients();
  }, [isAuthenticated, token]);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminClientsApi.getAll();
      setClients(data);
      if (data.length > 0) {
        toast.success(
          `${data.length} client${data.length > 1 ? "s" : ""} chargé${data.length > 1 ? "s" : ""}`,
        );
      }
    } catch (err: any) {
      setError(err.message || "Erreur de chargement des clients");
      toast.error(err.message || "Erreur");
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) return;

    try {
      await adminClientsApi.delete(id);
      setClients((prev) => prev.filter((c) => c._id !== id));
      toast.success("Client supprimé avec succès");
    } catch (err: any) {
      toast.error(err.message || "Erreur de suppression");
      console.error(err);
    }
  };

  const handleEdit = (id: string) => {
    // Redirection vers la page d'édition
    window.location.href = `/admin/clients/edit/${id}`;
  };

  const handleCreate = () => {
    window.location.href = "/admin/clients/create";
  };

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Chargement des clients...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Clients
          </h1>
          <p className="text-gray-600 mt-1">
            {clients.length} client{clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadClients}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "Chargement..." : "Actualiser"}
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Ajouter un client
          </button>
        </div>
      </div>

      {/* Table */}
      {error && clients.length === 0 && (
        <div className="text-red-600 mb-4 text-center">
          <p>{error}</p>
        </div>
      )}

      {clients.length > 0 ? (
        <ClientsTable
          clients={clients}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Users className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun client trouvé
          </h3>
          <p className="text-gray-600 mb-6">
            Commencez par ajouter votre premier client
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Ajouter le premier client
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminClientsPage;
