// frontend/src/pages/admin/AdminStaffPage.tsx
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import StaffTable from "../../components/admin/StaffTable";
// 🔥 IMPORT UNIQUE - Plus d'imports individuels
import adminStaffApi, { 
  type StaffMember, 
  StaffApiError 
} from "../../api/adminStaff.api";
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
  BarChart3,
  Settings,
  Mail,
  Phone,
  Calendar,
  Shield,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { formatDate } from "../../utils/formatters";
import { UserRole, hasPermission, canEdit, canDelete, canCreate } from "../../types/roles";
import { ProgressBar } from "../../components/admin/ProgressBar";
import dev from '../../utils/devLogger';

// Types pour les filtres
interface StaffFilters {
  role?: string;
  department?: string;
  isActive?: boolean;
  searchTerm: string;
}

// Types pour les statistiques
interface StaffStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
  byDepartment: Record<string, number>;
  recentHires: StaffMember[];
}

const AdminStaffPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, isAuthenticated } = useAuthStore();

  // États
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<StaffFilters>({
    searchTerm: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [showInactive, setShowInactive] = useState<boolean>(true);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [showStats, setShowStats] = useState(false);

  // Vérification des permissions avec les fonctions helper
  const userRole = user?.role as UserRole | undefined;
  
  // Utiliser les fonctions helper du fichier roles.ts
  const canEditStaff = userRole ? canEdit(userRole, 'staff') : false;
  const canDeleteStaff = userRole ? canDelete(userRole, 'staff') : false;
  const canCreateStaff = userRole ? canCreate(userRole, 'staff') : false;
  const canViewAll = userRole ? hasPermission(userRole, 'read:all') : false;

  // Fallback pour SUPER_ADMIN (au cas où)
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
  const finalCanEdit = canEditStaff || isSuperAdmin;
  const finalCanDelete = canDeleteStaff || isSuperAdmin;
  const finalCanCreate = canCreateStaff || isSuperAdmin;

  useEffect(() => {
    dev.log("🔍 AdminStaffPage mounted/updated", {
      isAuthenticated,
      userRole: user?.role,
      hasToken: !!token,
      canEdit: finalCanEdit,
      canDelete: finalCanDelete,
      canCreate: finalCanCreate,
      locationState: location.state,
    });

    if (!isAuthenticated || !token) {
      dev.log("❌ Not authenticated, skipping staff fetch");
      setIsLoading(false);
      setError("Non authentifié");
      return;
    }

    // If we come back from create/edit and a refresh flag is present, reload
    if (location.state && (location.state as any).refresh) {
      loadStaff();
      // clear flag so it doesn't retrigger
      navigate(location.pathname, { replace: true, state: {} });
    } else {
      loadStaff();
    }
  }, [isAuthenticated, token, user?.role, location]);

  // Effet pour filtrer les données
  useEffect(() => {
    if (!staff.length) return;

    let filtered = [...staff];

    // Filtre par recherche
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (member) =>
          member.firstName?.toLowerCase().includes(term) ||
          member.lastName?.toLowerCase().includes(term) ||
          member.email?.toLowerCase().includes(term) ||
          member.department?.toLowerCase().includes(term) ||
          member.position?.toLowerCase().includes(term)
      );
    }

    // Filtre par rôle
    if (selectedRole) {
      filtered = filtered.filter((member) => member.role === selectedRole);
    }

    // Filtre par département
    if (selectedDepartment) {
      filtered = filtered.filter((member) => member.department === selectedDepartment);
    }

    // Filtre par statut actif/inactif
    if (!showInactive) {
      filtered = filtered.filter((member) => member.isActive);
    }

    setFilteredStaff(filtered);
  }, [staff, filters.searchTerm, selectedRole, selectedDepartment, showInactive]);

  const loadStaff = async () => {
    try {
      setIsLoading(true);
      setError(null);

      dev.log("📡 Loading staff...");
      // 🔥 Utilisation de l'objet API
      const data = await adminStaffApi.getAll();

      dev.log("✅ Staff data received:", data.length, "members");

      setStaff(data);
      setFilteredStaff(data);

      if (data.length > 0) {
        toast.success(
          `${data.length} membre${data.length > 1 ? "s" : ""} chargé${data.length > 1 ? "s" : ""}`,
          { duration: 3000 }
        );
      }
    } catch (err: any) {
      const errorMessage = err instanceof StaffApiError 
        ? err.message 
        : err.message || "Erreur de chargement du personnel";
      
      setError(errorMessage);
      
      if (err.status === 401) {
        toast.error("Session expirée, veuillez vous reconnecter");
        navigate("/auth/login");
      } else if (err.status === 403) {
        toast.error("Vous n'avez pas les permissions nécessaires");
      } else {
        toast.error(errorMessage);
      }
      
      dev.error("❌ Error loading staff:", err);
      setStaff([]);
      setFilteredStaff([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!finalCanDelete) {
      toast.error("Vous n'avez pas la permission de supprimer");
      return;
    }

    const memberToDelete = staff.find(m => m._id === id);
    
    if (!memberToDelete) return;

    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer ${memberToDelete.firstName} ${memberToDelete.lastName} ?\nCette action est irréversible.`,
      )
    ) {
      return;
    }

    try {
      // 🔥 Utilisation de l'objet API
      await adminStaffApi.delete(id);

      setStaff((prevStaff) => {
        const updatedStaff = prevStaff.filter((member) => member._id !== id);
        return updatedStaff;
      });

      // Retirer de la sélection si présent
      setSelectedMembers(prev => {
        const newSelection = new Set(prev);
        newSelection.delete(id);
        return newSelection;
      });

      toast.success(`${memberToDelete.firstName} ${memberToDelete.lastName} a été supprimé`);
    } catch (err: any) {
      const errorMessage = err instanceof StaffApiError 
        ? err.message 
        : err.message || "Erreur de suppression";
      
      toast.error(errorMessage);
      dev.error("Error deleting staff:", err);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (!finalCanEdit) {
      toast.error("Vous n'avez pas la permission de modifier");
      return;
    }

    try {
      // 🔥 Utilisation de l'objet API
      const updatedMember = await adminStaffApi.toggleStatus(id, currentStatus);

      setStaff((prevStaff) =>
        prevStaff.map((member) =>
          member._id === id
            ? { ...member, ...updatedMember, isActive: updatedMember.isActive }
            : member,
        ),
      );

      toast.success(
        `Statut ${updatedMember.isActive ? "activé" : "désactivé"} pour ${updatedMember.firstName} ${updatedMember.lastName}`,
      );
    } catch (err: any) {
      const errorMessage = err instanceof StaffApiError 
        ? err.message 
        : err.message || "Erreur de mise à jour du statut";
      
      toast.error(errorMessage);
      dev.error("Error toggling staff status:", err);
    }
  };

  const handleBulkDelete = async () => {
    if (!finalCanDelete || selectedMembers.size === 0) return;

    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer ${selectedMembers.size} membre${selectedMembers.size > 1 ? "s" : ""} ?\nCette action est irréversible.`,
      )
    ) {
      return;
    }

    try {
      // 🔥 Utilisation de l'objet API pour la suppression groupée
      const ids = Array.from(selectedMembers);
      const result = await adminStaffApi.bulkDelete(ids);

      setStaff((prevStaff) => 
        prevStaff.filter((member) => member._id && !selectedMembers.has(member._id))
      );
      
      toast.success(`${result.success} membre${result.success > 1 ? "s" : ""} supprimé${result.success > 1 ? "s" : ""}`);
      if (result.failed > 0) {
        toast.error(`${result.failed} échec(s)`);
      }
      setSelectedMembers(new Set());
    } catch (err: any) {
      toast.error("Erreur lors de la suppression en masse");
      dev.error("Error bulk deleting:", err);
    }
  };

  const handleBulkStatusToggle = async (activate: boolean) => {
    if (!finalCanEdit || selectedMembers.size === 0) return;

    try {
      const ids = Array.from(selectedMembers);
      
      // Utilisation de bulkUpdate si disponible, sinon mise à jour individuelle
      if (adminStaffApi.bulkUpdate) {
        const result = await adminStaffApi.bulkUpdate(ids, { isActive: activate });
        
        setStaff((prevStaff) =>
          prevStaff.map((member) =>
            member._id && selectedMembers.has(member._id)
              ? { ...member, isActive: activate }
              : member,
          ),
        );

        toast.success(
          `${result.success} membre${result.success > 1 ? "s" : ""} ${activate ? "activé" : "désactivé"}${result.success > 1 ? "s" : ""}`,
        );
        if (result.failed > 0) {
          toast.error(`${result.failed} échec(s)`);
        }
      } else {
        // Fallback sur les appels individuels
        const promises = ids.map(id => adminStaffApi.toggleStatus(id, !activate));
        await Promise.all(promises);

        setStaff((prevStaff) =>
          prevStaff.map((member) =>
            member._id && selectedMembers.has(member._id)
              ? { ...member, isActive: activate }
              : member,
          ),
        );

        toast.success(
          `${ids.length} membre${ids.length > 1 ? "s" : ""} ${activate ? "activé" : "désactivé"}${ids.length > 1 ? "s" : ""}`,
        );
      }
      
      setSelectedMembers(new Set());
    } catch (err: any) {
      toast.error(`Erreur lors de ${activate ? "l'activation" : "la désactivation"} en masse`);
      dev.error("Error bulk toggling:", err);
    }
  };

  const handleExport = async () => {
    const dataToExport = selectedMembers.size > 0
      ? staff.filter(m => m._id && selectedMembers.has(m._id))
      : filteredStaff;

    if (dataToExport.length === 0) {
      toast.error("Aucune donnée à exporter");
      return;
    }

    try {
      // 🔥 Utilisation de l'API d'export si disponible
      if (adminStaffApi.export) {
        const blob = await adminStaffApi.export({
          format: 'csv',
          ids: selectedMembers.size > 0 ? Array.from(selectedMembers) : undefined,
          filters: {
            role: selectedRole || undefined,
            department: selectedDepartment || undefined,
            isActive: showInactive ? undefined : true,
          }
        });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `staff_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback sur l'export CSV manuel
        const headers = [
          "Prénom", "Nom", "Email", "Rôle", "Département", "Poste",
          "Téléphone", "Statut", "Date d'embauche", "Date de naissance"
        ];

        const rows = dataToExport.map(m => [
          m.firstName || "",
          m.lastName || "",
          m.email || "",
          m.role || "",
          m.department || "",
          m.position || "",
          m.phone || "",
          m.isActive ? "Actif" : "Inactif",
          m.hireDate ? formatDate(m.hireDate) : "",
          m.birthday ? formatDate(m.birthday) : "",
        ]);

        const csvContent = [
          headers.join(","),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `staff_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      
      toast.success(`${dataToExport.length} membre${dataToExport.length > 1 ? "s" : ""} exporté${dataToExport.length > 1 ? "s" : ""}`);
    } catch (err) {
      toast.error("Erreur lors de l'export");
      dev.error("Export error:", err);
    }
  };

  // Calcul des statistiques
  const stats = useMemo((): StaffStats => {
    const active = staff.filter(m => m.isActive).length;
    const inactive = staff.filter(m => !m.isActive).length;
    
    const byRole: Record<string, number> = {};
    const byDepartment: Record<string, number> = {};
    
    staff.forEach(member => {
      if (member.role) {
        byRole[member.role] = (byRole[member.role] || 0) + 1;
      }
      if (member.department) {
        byDepartment[member.department] = (byDepartment[member.department] || 0) + 1;
      }
    });

    const recentHires = [...staff]
      .filter(m => m.hireDate)
      .sort((a, b) => new Date(b.hireDate!).getTime() - new Date(a.hireDate!).getTime())
      .slice(0, 5);

    return {
      total: staff.length,
      active,
      inactive,
      byRole,
      byDepartment,
      recentHires,
    };
  }, [staff]);

  // Options uniques pour les filtres
  const roleOptions = useMemo(() => {
    const roles = new Set(staff.map(m => m.role).filter(Boolean) as string[]);
    return Array.from(roles);
  }, [staff]);

  const departmentOptions = useMemo(() => {
    const departments = new Set(staff.map(m => m.department).filter(Boolean) as string[]);
    return Array.from(departments);
  }, [staff]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Chargement des membres de l'équipe...</p>
      </div>
    );
  }

  if (error && staff.length === 0 && isAuthenticated) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 inline-flex rounded-full p-3 mb-4">
          <UserX className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-red-600 mb-6">{error}</p>
        <button
          onClick={loadStaff}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
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
        <div className="bg-yellow-50 inline-flex rounded-full p-3 mb-4">
          <Shield className="h-8 w-8 text-yellow-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Accès non autorisé
        </h3>
        <p className="text-gray-600 mb-6">
          Vous devez être connecté pour accéder à cette page
        </p>
        <Link
          to="/auth/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Gestion du Personnel
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredStaff.length} membre{filteredStaff.length !== 1 ? "s" : ""} 
            {filteredStaff.length !== staff.length && ` (${staff.length} au total)`}
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
              showFilters || selectedRole || selectedDepartment || !showInactive
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filtres
            {(selectedRole || selectedDepartment || !showInactive) && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {[selectedRole, selectedDepartment, !showInactive ? '1' : null].filter(Boolean).length}
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
            <BarChart3 className="h-4 w-4" />
            Stats
          </button>

          {/* Bouton export */}
          <button
            onClick={handleExport}
            disabled={filteredStaff.length === 0}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Exporter
            {selectedMembers.size > 0 && (
              <span className="bg-gray-200 text-gray-700 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {selectedMembers.size}
              </span>
            )}
          </button>

          {/* Bouton actualiser */}
          <button
            onClick={loadStaff}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </button>

          {/* Bouton ajouter - Utilise finalCanCreate */}
          {finalCanCreate && (
            <Link
              to="/admin/staff/create"
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
                setSelectedRole("");
                setSelectedDepartment("");
                setShowInactive(true);
                setFilters(prev => ({ ...prev, searchTerm: "" }));
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Réinitialiser
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Filtrer par rôle"
              >
                <option value="">Tous les rôles</option>
                {roleOptions.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Département
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Filtrer par département"
              >
                <option value="">Tous les départements</option>
                {departmentOptions.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
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
                aria-label="Filtrer par statut"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous</option>
                <option value="active">Actifs uniquement</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Panneau de statistiques */}
      {showStats && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">Statistiques</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
              <p className="text-sm text-purple-600">Départements</p>
              <p className="text-2xl font-bold text-purple-700">{Object.keys(stats.byDepartment).length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Répartition par rôle</h4>
              <div className="space-y-2">
                {Object.entries(stats.byRole).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{role}</span>
                    <ProgressBar value={count} max={stats.total} color="blue" count={count} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Répartition par département</h4>
              <div className="space-y-2">
                {Object.entries(stats.byDepartment).map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{dept}</span>
                    <ProgressBar value={count} max={stats.total} color="green" count={count} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {stats.recentHires.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">5 derniers arrivants</h4>
              <div className="space-y-2">
                {stats.recentHires.map(member => (
                  <div key={member._id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-900">{member.firstName} {member.lastName}</span>
                    <span className="text-gray-500">{member.hireDate ? formatDate(member.hireDate) : '-'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions groupées */}
      {selectedMembers.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-700">
              {selectedMembers.size} membre{selectedMembers.size > 1 ? "s" : ""} sélectionné{selectedMembers.size > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkStatusToggle(true)}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            >
              Activer tous
            </button>
            <button
              onClick={() => handleBulkStatusToggle(false)}
              className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors"
            >
              Désactiver tous
            </button>
            {finalCanDelete && (
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Supprimer tous
              </button>
            )}
            <button
              onClick={() => setSelectedMembers(new Set())}
              className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Message d'erreur partielle */}
      {error && staff.length > 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            ⚠️ Note: {error} (affichage des données existantes)
          </p>
        </div>
      )}

      {/* Tableau */}
      {filteredStaff.length > 0 ? (
        <StaffTable
          staff={filteredStaff}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          selectedStaff={selectedMembers}
          onSelectStaff={(id: string) => {
            const newSelection = new Set(selectedMembers);
            if (newSelection.has(id)) {
              newSelection.delete(id);
            } else {
              newSelection.add(id);
            }
            setSelectedMembers(newSelection);
          }}
          onSelectAll={() => {
            if (selectedMembers.size === filteredStaff.length) {
              setSelectedMembers(new Set());
            } else {
              setSelectedMembers(new Set(filteredStaff.map(m => m._id!).filter(Boolean)));
            }
          }}
          canEdit={finalCanEdit}
          canDelete={finalCanDelete}
        />
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="bg-gray-50 inline-flex rounded-full p-4 mb-4">
            <Users className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {staff.length === 0 ? "Aucun membre trouvé" : "Aucun résultat"}
          </h3>
          <p className="text-gray-600 mb-6">
            {staff.length === 0 
              ? "Commencez par ajouter votre premier membre de l'équipe"
              : "Aucun membre ne correspond aux filtres sélectionnés"}
          </p>
          {staff.length === 0 && finalCanCreate && (
            <Link
              to="/admin/staff/create"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Ajouter le premier membre
            </Link>
          )}
          {staff.length > 0 && (
            <button
              onClick={() => {
                setSelectedRole("");
                setSelectedDepartment("");
                setShowInactive(true);
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
          <Settings className="h-4 w-4" />
          Guide d'utilisation
        </h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
          <li>Cliquez sur le statut (Actif/Inactif) pour activer/désactiver un membre</li>
          <li>Utilisez les cases à cocher pour la sélection multiple et les actions groupées</li>
          <li>Les filtres vous permettent d'affiner la liste par rôle, département ou statut</li>
          <li>Exportez la liste au format CSV pour l'utiliser dans Excel ou autre</li>
          <li>Les statistiques vous donnent une vue d'ensemble de votre équipe</li>
          {!finalCanEdit && <li className="text-yellow-700">⚠️ Vous êtes en mode lecture seule</li>}
        </ul>
      </div>
    </div>
  );
};

export default AdminStaffPage;