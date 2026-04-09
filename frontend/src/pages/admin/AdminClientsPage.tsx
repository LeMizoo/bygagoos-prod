// frontend/src/pages/admin/AdminClientsPage.tsx
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  PlusCircle,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  Download,
  Filter,
  Search,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  TrendingUp,
  AlertCircle,
  Star,
  Building2,
} from "lucide-react";

import { useAuthStore } from "../../stores/authStore";
import adminClientsApi from "../../api/adminClients.api";
import { Client } from "../../types/client";
import ClientsTable from "../../components/admin/ClientsTable";
import { formatDate } from "../../utils/formatters";
import { UserRole, hasPermission } from "../../types/roles";
import { ProgressBar } from "../../components/admin/ProgressBar";
import dev from '../../utils/devLogger';

// Types pour les filtres
interface ClientFilters {
  searchTerm: string;
  city?: string;
  isActive?: boolean;
  hasCompany?: boolean;
}

// Types pour les statistiques
interface ClientStats {
  total: number;
  active: number;
  inactive: number;
  withCompany: number;
  withoutCompany: number;
  topCities: { city: string; count: number }[];
  recentClients: Client[];
  withPhone: number;
  withEmail: number;
}

const AdminClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuthStore();

  // États
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ClientFilters>({
    searchTerm: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [showInactive, setShowInactive] = useState<boolean>(true);
  const [showWithCompany, setShowWithCompany] = useState<boolean>(false);
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [showStats, setShowStats] = useState(false);

  // Vérification des permissions
  const userRole = user?.role as UserRole | undefined;
  const canEdit = userRole ? hasPermission(userRole, 'write:clients') : false;
  const canDelete = userRole ? hasPermission(userRole, 'delete:clients') : false;

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setIsLoading(false);
      setError("Non authentifié");
      return;
    }
    loadClients();
  }, [isAuthenticated, token]);

  // Effet pour filtrer les données
  useEffect(() => {
    if (!clients.length) return;

    let filtered = [...clients];

    // Filtre par recherche
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          client.firstName?.toLowerCase().includes(term) ||
          client.lastName?.toLowerCase().includes(term) ||
          client.email?.toLowerCase().includes(term) ||
          (client.company && client.company.toLowerCase().includes(term)) ||
          (client.phone && client.phone.includes(term)) ||
          (client.city && client.city.toLowerCase().includes(term))
      );
    }

    // Filtre par ville
    if (selectedCity) {
      filtered = filtered.filter((client) => client.city === selectedCity);
    }

    // Filtre par statut actif/inactif
    if (!showInactive) {
      filtered = filtered.filter((client) => client.isActive === true);
    }

    // Filtre par présence d'entreprise
    if (showWithCompany) {
      filtered = filtered.filter((client) => client.company && client.company.trim() !== "");
    }

    setFilteredClients(filtered);
  }, [clients, filters.searchTerm, selectedCity, showInactive, showWithCompany]);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminClientsApi.getAll();
      setClients(data);
      setFilteredClients(data);
      
      if (data.length > 0) {
        toast.success(
          `${data.length} client${data.length > 1 ? "s" : ""} chargé${data.length > 1 ? "s" : ""}`,
          { duration: 3000 }
        );
      }
    } catch (err: any) {
      const errorMessage = err.message || "Erreur de chargement des clients";
      setError(errorMessage);
      
      if (err.statusCode === 401) {
        toast.error("Session expirée, veuillez vous reconnecter");
        navigate("/auth/login");
      } else {
        toast.error(errorMessage);
      }
      
      setClients([]);
      setFilteredClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      toast.error("Vous n'avez pas la permission de supprimer");
      return;
    }

    const clientToDelete = clients.find(c => c._id === id);
    if (!clientToDelete) return;

    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${clientToDelete.firstName} ${clientToDelete.lastName} ?`)) return;

    try {
      await adminClientsApi.delete(id);
      setClients((prev) => prev.filter((c) => c._id !== id));
      setSelectedClients(prev => {
        const newSelection = new Set(prev);
        newSelection.delete(id);
        return newSelection;
      });
      toast.success("Client supprimé avec succès");
    } catch (err: any) {
      toast.error(err.message || "Erreur de suppression");
      dev.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if (!canDelete || selectedClients.size === 0) return;

    if (!confirm(`Supprimer ${selectedClients.size} client${selectedClients.size > 1 ? "s" : ""} ?`)) return;

    try {
      // Utiliser Promise.all pour les suppressions multiples
      const deletePromises = Array.from(selectedClients).map(id => adminClientsApi.delete(id));
      await Promise.all(deletePromises);

      setClients((prev) => prev.filter((c) => c._id && !selectedClients.has(c._id)));
      toast.success(`${selectedClients.size} client${selectedClients.size > 1 ? "s" : ""} supprimé${selectedClients.size > 1 ? "s" : ""}`);
      setSelectedClients(new Set());
    } catch (err: any) {
      toast.error("Erreur lors de la suppression en masse");
      dev.error(err);
    }
  };

  const handleExport = () => {
    const dataToExport = selectedClients.size > 0
      ? clients.filter(c => c._id && selectedClients.has(c._id))
      : filteredClients;

    if (dataToExport.length === 0) {
      toast.error("Aucune donnée à exporter");
      return;
    }

    try {
      const headers = [
        "Prénom", "Nom", "Email", "Téléphone", "Entreprise",
        "Ville", "Adresse", "Code postal", "Pays", "Statut",
        "Date d'inscription", "Notes"
      ];

      const rows = dataToExport.map(c => [
        c.firstName || "",
        c.lastName || "",
        c.email || "",
        c.phone || "",
        c.company || "",
        c.city || "",
        c.address || "",
        c.postalCode || "",
        c.country || "",
        c.isActive ? "Actif" : "Inactif",
        c.createdAt ? formatDate(c.createdAt) : "",
        c.notes || "",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `clients_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${dataToExport.length} client${dataToExport.length > 1 ? "s" : ""} exporté${dataToExport.length > 1 ? "s" : ""}`);
    } catch (err) {
      toast.error("Erreur lors de l'export");
      dev.error("Export error:", err);
    }
  };

  // Calcul des statistiques
  const stats = useMemo((): ClientStats => {
    const active = clients.filter(c => c.isActive === true).length;
    const inactive = clients.filter(c => c.isActive === false).length;
    const withCompany = clients.filter(c => c.company && c.company.trim() !== "").length;
    const withoutCompany = clients.length - withCompany;
    const withPhone = clients.filter(c => c.phone && c.phone.trim() !== "").length;
    const withEmail = clients.filter(c => c.email && c.email.trim() !== "").length;

    // Compter les villes
    const cityCount: Record<string, number> = {};
    clients.forEach(client => {
      if (client.city) {
        cityCount[client.city] = (cityCount[client.city] || 0) + 1;
      }
    });

    const topCities = Object.entries(cityCount)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const recentClients = [...clients]
      .filter(c => c.createdAt)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 5);

    return {
      total: clients.length,
      active,
      inactive,
      withCompany,
      withoutCompany,
      topCities,
      recentClients,
      withPhone,
      withEmail,
    };
  }, [clients]);

  // Options pour les filtres
  const cityOptions = useMemo(() => {
    const cities = new Set(clients.map(c => c.city).filter(Boolean) as string[]);
    return Array.from(cities);
  }, [clients]);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-50 inline-flex rounded-full p-3 mb-4">
          <Users className="h-8 w-8 text-yellow-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Accès non autorisé
        </h3>
        <p className="text-gray-600 mb-6">
          Vous devez être connecté pour accéder à cette page
        </p>
        <Link
          to="/auth/login"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Chargement des clients...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            Gestion des Clients
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredClients.length} client{filteredClients.length !== 1 ? "s" : ""}
            {filteredClients.length !== clients.length && ` (${clients.length} au total)`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>

          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
              showFilters || selectedCity || !showInactive || showWithCompany
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filtres
            {(selectedCity || !showInactive || showWithCompany) && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {[selectedCity, !showInactive ? '1' : null, showWithCompany ? '1' : null].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Bouton statistiques */}
          <button
            onClick={() => setShowStats(!showStats)}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
              showStats ? "bg-purple-50 border-purple-300 text-purple-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Stats
          </button>

          {/* Bouton export */}
          <button
            onClick={handleExport}
            disabled={filteredClients.length === 0}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Exporter
            {selectedClients.size > 0 && (
              <span className="bg-gray-200 text-gray-700 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {selectedClients.size}
              </span>
            )}
          </button>

          {/* Bouton actualiser */}
          <button
            onClick={loadClients}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </button>

          {/* Bouton ajouter */}
          {canEdit && (
            <Link
              to="/admin/clients/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Ajouter
            </Link>
          )}
        </div>
      </div>

      {/* Panneau de filtres */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Filtres avancés</h3>
            <button
              onClick={() => {
                setSelectedCity("");
                setShowInactive(true);
                setShowWithCompany(false);
                setFilters(prev => ({ ...prev, searchTerm: "" }));
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Réinitialiser
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Filtrer par ville"
              >
                <option value="">Toutes les villes</option>
                {cityOptions.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={showInactive ? "all" : "active"}
                onChange={(e) => setShowInactive(e.target.value === "all")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Filtrer par actifs/inactifs"
              >
                <option value="all">Tous</option>
                <option value="active">Actifs uniquement</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entreprise
              </label>
              <select
                value={showWithCompany ? "with" : "all"}
                onChange={(e) => setShowWithCompany(e.target.value === "with")}
                aria-label="Filtrer par entreprise"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous</option>
                <option value="with">Avec entreprise</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Panneau de statistiques */}
      {showStats && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">Statistiques clients</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-600">Total</p>
              <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-600">Actifs</p>
              <p className="text-2xl font-bold text-green-700">{stats.active}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-red-600">Inactifs</p>
              <p className="text-2xl font-bold text-red-700">{stats.inactive}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm text-purple-600">Avec entreprise</p>
              <p className="text-2xl font-bold text-purple-700">{stats.withCompany}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-sm text-orange-600">Sans entreprise</p>
              <p className="text-2xl font-bold text-orange-700">{stats.withoutCompany}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Top 5 villes</h4>
              <div className="space-y-2">
                {stats.topCities.map(({ city, count }) => (
                  <div key={city} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{city}</span>
                    <ProgressBar value={count} max={stats.total} color="green" count={count} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Qualité des données</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avec email</span>
                  <span className="text-sm font-medium text-gray-900">{stats.withEmail} / {stats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avec téléphone</span>
                  <span className="text-sm font-medium text-gray-900">{stats.withPhone} / {stats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avec entreprise</span>
                  <span className="text-sm font-medium text-gray-900">{stats.withCompany} / {stats.total}</span>
                </div>
              </div>
            </div>
          </div>

          {stats.recentClients.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">5 derniers clients</h4>
              <div className="space-y-2">
                {stats.recentClients.map(client => (
                  <div key={client._id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-900">{client.firstName} {client.lastName}</span>
                    <span className="text-gray-500">{client.createdAt ? formatDate(client.createdAt) : '-'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions groupées */}
      {selectedClients.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-700">
              {selectedClients.size} client{selectedClients.size > 1 ? "s" : ""} sélectionné{selectedClients.size > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex gap-2">
            {canDelete && (
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Supprimer tous
              </button>
            )}
            <button
              onClick={() => setSelectedClients(new Set())}
              className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && clients.length === 0 && (
        <div className="text-red-600 mb-4 text-center p-4 bg-red-50 rounded-lg">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      )}

      {/* Tableau */}
      {filteredClients.length > 0 ? (
        <ClientsTable
          clients={filteredClients}
          onDelete={handleDelete}
          onEdit={(id) => navigate(`/admin/clients/edit/${id}`)}
          selectedClients={selectedClients}
          onSelectClient={(id) => {
            const newSelection = new Set(selectedClients);
            if (newSelection.has(id)) {
              newSelection.delete(id);
            } else {
              newSelection.add(id);
            }
            setSelectedClients(newSelection);
          }}
          onSelectAll={() => {
            if (selectedClients.size === filteredClients.length) {
              setSelectedClients(new Set());
            } else {
              setSelectedClients(new Set(filteredClients.map(c => c._id!).filter(Boolean)));
            }
          }}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="bg-gray-50 inline-flex rounded-full p-4 mb-4">
            <Building2 className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {clients.length === 0 ? "Aucun client trouvé" : "Aucun résultat"}
          </h3>
          <p className="text-gray-600 mb-6">
            {clients.length === 0 
              ? "Commencez par ajouter votre premier client"
              : "Aucun client ne correspond aux filtres sélectionnés"}
          </p>
          {clients.length === 0 && canEdit && (
            <Link
              to="/admin/clients/create"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Ajouter le premier client
            </Link>
          )}
          {clients.length > 0 && (
            <button
              onClick={() => {
                setSelectedCity("");
                setShowInactive(true);
                setShowWithCompany(false);
                setFilters(prev => ({ ...prev, searchTerm: "" }));
              }}
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Filter className="h-4 w-4 mr-2" />
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}

      {/* Guide d'utilisation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Guide d'utilisation
        </h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
          <li>Utilisez la recherche pour trouver rapidement un client par nom, email ou entreprise</li>
          <li>Les filtres vous permettent de voir les clients par ville ou par statut</li>
          <li>Sélectionnez plusieurs clients pour des actions groupées</li>
          <li>Exportez la liste au format CSV pour vos besoins de prospection</li>
          <li>Les statistiques vous aident à mieux connaître votre clientèle</li>
          {!canEdit && <li className="text-yellow-700">⚠️ Vous êtes en mode lecture seule</li>}
        </ul>
      </div>
    </div>
  );
};

export default AdminClientsPage;