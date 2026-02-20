// frontend/src/pages/admin/ClientDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  Building,
  FileText,
  User,
  Users,
} from "lucide-react";
import { adminClientsApi } from "../../api/adminClients.api";
import { Client as ClientType } from "../../api/adminClients.api";
import toast from "react-hot-toast";

const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchClient();
    }
  }, [id]);

  const fetchClient = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await adminClientsApi.getById(id);
      setClient(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement du client");
      toast.error("Erreur lors du chargement du client");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !client) return;

    setDeleting(true);
    try {
      await adminClientsApi.delete(id);
      toast.success("Client supprimé avec succès");
      navigate("/admin/clients");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la suppression du client");
      console.error(err);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!id || !client) return;

    try {
      const newStatus = client.status === "active" ? "inactive" : "active";
      const updatedClient = await adminClientsApi.toggleStatus(
        id,
        newStatus as "active" | "inactive",
      );
      setClient(updatedClient);
      toast.success(
        `Statut ${newStatus === "active" ? "activé" : "désactivé"}`,
      );
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du changement de statut");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getClientName = (client: ClientType) => {
    return `${client.firstName} ${client.lastName}`.trim();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Chargement du client...</span>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-6">
        <Link
          to="/admin/clients"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la liste
        </Link>
        <div className="p-4 text-red-700 bg-red-100 rounded-lg">
          {error || "Client non trouvé"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header avec boutons */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/admin/clients"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la liste
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getClientName(client)}
            </h1>
            <p className="text-gray-600 text-sm">
              Client depuis le {formatDate(client.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggleStatus}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              client.status === "active"
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-red-100 text-red-800 hover:bg-red-200"
            }`}
          >
            {client.status === "active" ? (
              <>
                <User className="w-4 h-4 mr-2" />
                Désactiver
              </>
            ) : (
              <>
                <User className="w-4 h-4 mr-2" />
                Activer
              </>
            )}
          </button>

          <Link
            to={`/admin/clients/edit/${id}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Link>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700"
            disabled={deleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleting ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Commandes totales</p>
              <p className="text-2xl font-bold text-gray-900">
                {client.totalOrders || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">CA Total</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(client.totalSpent)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Dernière commande</p>
              <p className="text-lg font-bold text-gray-900">
                {client.totalOrders && client.totalOrders > 0
                  ? "Récente"
                  : "Aucune"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div
              className={`p-3 rounded-full mr-4 ${
                client.status === "active"
                  ? "bg-green-100"
                  : client.status === "inactive"
                    ? "bg-red-100"
                    : "bg-yellow-100"
              }`}
            >
              <User
                className={`h-6 w-6 ${
                  client.status === "active"
                    ? "text-green-600"
                    : client.status === "inactive"
                      ? "text-red-600"
                      : "text-yellow-600"
                }`}
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">Statut</p>
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}
              >
                {client.status === "active"
                  ? "Actif"
                  : client.status === "inactive"
                    ? "Inactif"
                    : "En attente"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Informations client */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Section principale */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-xl">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Informations personnelles
              </h2>

              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 mr-4 mt-1 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <a
                      href={`mailto:${client.email}`}
                      className="text-gray-900 hover:text-blue-600 hover:underline"
                    >
                      {client.email}
                    </a>
                  </div>
                </div>

                {/* Téléphone */}
                {client.phone && (
                  <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 mr-4 mt-1 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Téléphone
                      </p>
                      <a
                        href={`tel:${client.phone}`}
                        className="text-gray-900 hover:text-blue-600 hover:underline"
                      >
                        {client.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Société */}
                {client.company && (
                  <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                    <Building className="w-5 h-5 mr-4 mt-1 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Société
                      </p>
                      <p className="text-gray-900">{client.company}</p>
                    </div>
                  </div>
                )}

                {/* Adresse */}
                {client.address && (
                  <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 mr-4 mt-1 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Adresse
                      </p>
                      <p className="text-gray-900 whitespace-pre-line">
                        {client.address}
                      </p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {client.notes && (
                  <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 mr-4 mt-1 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">
                        Notes
                      </p>
                      <p className="text-gray-900 whitespace-pre-line">
                        {client.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Métadonnées */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <p className="font-medium">Créé le</p>
                    <p>{formatDate(client.createdAt)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Modifié le</p>
                    <p>{formatDate(client.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section commandes */}
          <div className="mt-6 bg-white shadow-sm rounded-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Historique des commandes
                </h3>
                <Link
                  to="/admin/orders/create"
                  state={{ clientId: client._id }}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Nouvelle commande
                </Link>
              </div>

              {client.totalOrders && client.totalOrders > 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">
                    {client.totalOrders} commande
                    {client.totalOrders !== 1 ? "s" : ""} pour ce client
                  </p>
                  <Link
                    to="/admin/orders"
                    className="inline-block mt-2 text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Voir toutes les commandes →
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucune commande pour le moment</p>
                  <Link
                    to="/admin/orders/create"
                    state={{ clientId: client._id }}
                    className="inline-block mt-3 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Créer une première commande
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section latérale */}
        <div className="space-y-6">
          {/* Actions rapides */}
          <div className="bg-white shadow-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actions rapides
            </h3>
            <div className="space-y-3">
              <Link
                to={`/admin/orders/create?clientId=${client._id}`}
                className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
              >
                <Package className="w-4 h-4 mr-2" />
                Nouvelle commande
              </Link>

              <Link
                to={`/admin/clients/edit/${id}`}
                className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier les informations
              </Link>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer le client
              </button>
            </div>
          </div>

          {/* Informations complémentaires */}
          <div className="bg-white shadow-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Statistiques
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Commandes totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {client.totalOrders || 0}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">
                  Chiffre d'affaires total
                </p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(client.totalSpent)}
                </p>
              </div>

              {client.totalOrders && client.totalOrders > 0 && (
                <div>
                  <p className="text-sm text-gray-600">Moyenne par commande</p>
                  <p className="text-lg font-medium text-gray-900">
                    {formatCurrency(
                      (client.totalSpent || 0) / client.totalOrders,
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Supprimer le client
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Êtes-vous sûr de vouloir supprimer le client "
                      {getClientName(client)}" ? Cette action est irréversible.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={deleting}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Suppression...
                    </>
                  ) : (
                    "Supprimer"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant Plus pour compléter
const Plus = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

export default ClientDetailPage;
