// frontend/src/pages/admin/ClientsPage.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Search,
  Filter,
  Download,
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Mail,
  Phone,
  Building,
  MapPin,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { adminClientsApi } from "../../api/adminClients.api";
import toast from "react-hot-toast";

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  totalOrders?: number;
  totalSpent?: number;
  status?: "active" | "inactive" | "pending";
}

const ClientsPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newThisMonth: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    loadClients();
  }, [isAuthenticated]);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, filterStatus]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await adminClientsApi.getAll();
      setClients(data);
      setFilteredClients(data);

      // Calculer les statistiques
      const total = data.length;
      const active = data.filter((c) => c.status === "active").length;
      const inactive = data.filter((c) => c.status === "inactive").length;
      const totalRevenue = data.reduce(
        (sum, client) => sum + (client.totalSpent || 0),
        0,
      );
      const totalOrders = data.reduce(
        (sum, client) => sum + (client.totalOrders || 0),
        0,
      );
      const averageOrderValue =
        totalOrders > 0 ? totalRevenue / totalOrders : 0;

      setStats({
        total,
        active,
        inactive,
        newThisMonth: 0, // À implémenter avec la date
        totalRevenue,
        averageOrderValue,
      });
    } catch (error: any) {
      console.error("Error loading clients:", error);
      toast.error("Erreur lors du chargement des clients");
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = [...clients];

    // Recherche par nom, email ou téléphone
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((client) => {
        const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
        return (
          fullName.includes(term) ||
          client.email.toLowerCase().includes(term) ||
          (client.phone && client.phone.toLowerCase().includes(term)) ||
          (client.company && client.company.toLowerCase().includes(term))
        );
      });
    }

    // Filtre par statut
    if (filterStatus !== "all") {
      filtered = filtered.filter((client) => client.status === filterStatus);
    }

    setFilteredClients(filtered);
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir supprimer le client "${name}" ?`,
      )
    ) {
      return;
    }

    try {
      await adminClientsApi.delete(id);
      setClients((prev) => prev.filter((client) => client._id !== id));
      toast.success("Client supprimé avec succès");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await adminClientsApi.toggleStatus(
        id,
        newStatus as "active" | "inactive",
      );

      setClients((prev) =>
        prev.map((client) =>
          client._id === id
            ? {
                ...client,
                status: newStatus as "active" | "inactive" | "pending",
              }
            : client,
        ),
      );

      toast.success(
        `Statut ${newStatus === "active" ? "activé" : "désactivé"}`,
      );
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du changement de statut");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR");
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

  const getClientName = (client: Client) => {
    return `${client.firstName} ${client.lastName}`.trim();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Chargement des clients...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Clients
          </h1>
          <p className="text-gray-600 mt-1">
            {clients.length} client{clients.length !== 1 ? "s" : ""} enregistré
            {clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/admin/clients/create"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Nouveau client
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total clients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clients actifs</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.active}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clients inactifs</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.inactive}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">CA total</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un client par nom, email, téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none bg-white pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="pending">En attente</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Liste des clients */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Client
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Commandes
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  CA Total
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Statut
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucun client trouvé
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm || filterStatus !== "all"
                        ? "Aucun client ne correspond à vos critères de recherche."
                        : "Commencez par ajouter votre premier client."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {getClientName(client).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getClientName(client)}
                          </div>
                          {client.company && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <Building className="h-3 w-3 mr-1" />
                              {client.company}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="h-3 w-3 mr-2 text-gray-400" />
                          {client.email}
                        </div>
                        {client.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="h-3 w-3 mr-2 text-gray-400" />
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {client.totalOrders || 0} commande
                        {client.totalOrders !== 1 ? "s" : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(client.totalSpent || 0)}
                      </div>
                      {client.totalOrders && client.totalOrders > 0 && (
                        <div className="text-sm text-gray-500">
                          Moyenne:{" "}
                          {formatCurrency(
                            (client.totalSpent || 0) / client.totalOrders,
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() =>
                          handleToggleStatus(
                            client._id,
                            client.status || "active",
                          )
                        }
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${getStatusColor(client.status)} hover:opacity-80`}
                        title={`Cliquer pour ${client.status === "active" ? "désactiver" : "activer"}`}
                      >
                        {client.status === "active" ? (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Actif
                          </>
                        ) : client.status === "inactive" ? (
                          <>
                            <UserX className="h-3 w-3 mr-1" />
                            Inactif
                          </>
                        ) : (
                          "En attente"
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/admin/clients/${client._id}`}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/admin/clients/edit/${client._id}`}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(client._id, getClientName(client))
                          }
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;
