// frontend/src/components/admin/StaffTable.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  MoreVertical,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  RefreshCw,
  Star,
  MapPin,
  Award,
} from "lucide-react";
import { StaffMember } from "../../api/adminStaff.api";
import { formatDate } from "../../utils/formatters";
import { UserRole } from "../../types/roles";

interface StaffTableProps {
  staff: StaffMember[];
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  selectedMembers?: Set<string>;
  onSelectMember?: (id: string) => void;
  onSelectAll?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  loading?: boolean;
  filters?: {
    role?: string;
    department?: string;
    status?: 'all' | 'active' | 'inactive';
    onRoleChange?: (role: string) => void;
    onDepartmentChange?: (dept: string) => void;
    onStatusChange?: (status: 'all' | 'active' | 'inactive') => void;
    roleOptions?: string[];
    departmentOptions?: string[];
  };
}

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
  ADMIN: "bg-red-100 text-red-800 border-red-200",
  MANAGER: "bg-blue-100 text-blue-800 border-blue-200",
  DESIGNER: "bg-green-100 text-green-800 border-green-200",
  STAFF: "bg-gray-100 text-gray-800 border-gray-200",
  CLIENT: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrateur",
  MANAGER: "Manager",
  DESIGNER: "Designer",
  STAFF: "Personnel",
  CLIENT: "Client",
};

const StaffTable: React.FC<StaffTableProps> = ({
  staff,
  onDelete,
  onToggleStatus,
  selectedMembers = new Set(),
  onSelectMember,
  onSelectAll,
  canEdit = true,
  canDelete = true,
  onRefresh,
  onExport,
  loading = false,
  filters,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StaffMember;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Fonction de tri
  const sortedStaff = React.useMemo(() => {
    if (!sortConfig) return staff;

    return [...staff].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [staff, sortConfig]);

  const handleSort = (key: keyof StaffMember) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (key: keyof StaffMember) => {
    if (sortConfig?.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-0">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
              <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* En-tête avec filtres */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Liste des membres ({staff.length})
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filtres */}
            {filters && (
              <>
                {filters.roleOptions && filters.roleOptions.length > 0 && (
                  <select
                    value={filters.role || ''}
                    onChange={(e) => filters.onRoleChange?.(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous les rôles</option>
                    {filters.roleOptions.map(role => (
                      <option key={role} value={role}>{roleLabels[role] || role}</option>
                    ))}
                  </select>
                )}

                {filters.departmentOptions && filters.departmentOptions.length > 0 && (
                  <select
                    value={filters.department || ''}
                    onChange={(e) => filters.onDepartmentChange?.(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous les départements</option>
                    {filters.departmentOptions.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                )}

                <select
                  value={filters.status || 'all'}
                  onChange={(e) => filters.onStatusChange?.(e.target.value as any)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                </select>
              </>
            )}

            {/* Boutons d'action */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                title="Actualiser"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}

            {onExport && staff.length > 0 && (
              <button
                onClick={onExport}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                title="Exporter"
              >
                <Download className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {/* Case à cocher pour sélection multiple */}
              {onSelectMember && onSelectAll && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedMembers.size === staff.length && staff.length > 0}
                    onChange={onSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('firstName')}
              >
                <div className="flex items-center gap-1">
                  Membre {getSortIcon('firstName')}
                </div>
              </th>
              
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Contact
              </th>
              
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('role')}
              >
                <div className="flex items-center gap-1">
                  Rôle {getSortIcon('role')}
                </div>
              </th>
              
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('department')}
              >
                <div className="flex items-center gap-1">
                  Département {getSortIcon('department')}
                </div>
              </th>
              
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('isActive')}
              >
                <div className="flex items-center gap-1">
                  Statut {getSortIcon('isActive')}
                </div>
              </th>
              
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('hireDate')}
              >
                <div className="flex items-center gap-1">
                  Date d'embauche {getSortIcon('hireDate')}
                </div>
              </th>
              
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStaff.map((member) => (
              <React.Fragment key={member._id}>
                <tr 
                  className={`border-t border-gray-200 hover:bg-gray-50 transition-colors ${
                    expandedRow === member._id ? 'bg-blue-50' : ''
                  }`}
                >
                  {/* Checkbox */}
                  {onSelectMember && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedMembers.has(member._id!)}
                        onChange={() => onSelectMember(member._id!)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}

                  {/* Membre */}
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 bg-gradient-to-br ${
                        member.role === 'SUPER_ADMIN' 
                          ? 'from-purple-500 to-purple-600' 
                          : member.role === 'ADMIN'
                            ? 'from-red-500 to-red-600'
                            : member.role === 'MANAGER'
                              ? 'from-blue-500 to-blue-600'
                              : 'from-gray-500 to-gray-600'
                      } rounded-full flex items-center justify-center text-white font-medium shadow-sm`}>
                        {member.firstName?.[0] || ''}{member.lastName?.[0] || ''}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Award className="h-3 w-3 mr-1" />
                          {member.position || 'Sans poste'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {member.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                          <span className="truncate max-w-[150px]">{member.email}</span>
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                          {member.phone}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Rôle */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                      roleColors[member.role] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {roleLabels[member.role] || member.role}
                    </span>
                  </td>

                  {/* Département */}
                  <td className="px-4 py-3">
                    <div className="flex items-center text-sm text-gray-700">
                      <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                      {member.department || '-'}
                    </div>
                  </td>

                  {/* Statut */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => canEdit && onToggleStatus(member._id!, member.isActive)}
                      disabled={!canEdit}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        member.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } ${!canEdit && 'cursor-default opacity-75'}`}
                      title={member.isActive ? 'Cliquez pour désactiver' : 'Cliquez pour activer'}
                    >
                      {member.isActive ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Actif
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactif
                        </>
                      )}
                    </button>
                  </td>

                  {/* Date d'embauche */}
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {member.hireDate ? (
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                        {formatDate(member.hireDate)}
                      </div>
                    ) : '-'}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        to={`/admin/staff/${member._id}`}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      
                      {canEdit && (
                        <Link
                          to={`/admin/staff/edit/${member._id}`}
                          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      )}
                      
                      {canDelete && (
                        <button
                          onClick={() => onDelete(member._id!)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}

                      {/* Bouton pour développer/réduire */}
                      <button
                        onClick={() => setExpandedRow(expandedRow === member._id ? null : member._id!)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Ligne détaillée (mobile/tablette) */}
                {expandedRow === member._id && (
                  <tr className="bg-blue-50 border-t border-blue-200 lg:hidden">
                    <td colSpan={onSelectMember ? 8 : 7} className="px-4 py-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Informations</p>
                          <p className="text-gray-600">Email: {member.email || '-'}</p>
                          <p className="text-gray-600">Tél: {member.phone || '-'}</p>
                          <p className="text-gray-600">Poste: {member.position || '-'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Détails</p>
                          <p className="text-gray-600">Rôle: {member.role}</p>
                          <p className="text-gray-600">Dépt: {member.department || '-'}</p>
                          <p className="text-gray-600">
                            Embauché: {member.hireDate ? formatDate(member.hireDate) : '-'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pied de tableau */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            {selectedMembers.size > 0 ? (
              <span className="font-medium text-blue-600">
                {selectedMembers.size} membre{selectedMembers.size > 1 ? 's' : ''} sélectionné{selectedMembers.size > 1 ? 's' : ''}
              </span>
            ) : (
              <span>{staff.length} membre{staff.length > 1 ? 's' : ''} au total</span>
            )}
          </div>
          
          {selectedMembers.size > 0 && (
            <div className="flex items-center gap-2">
              {canEdit && (
                <button
                  onClick={() => {
                    const allActive = Array.from(selectedMembers).every(
                      id => staff.find(m => m._id === id)?.isActive
                    );
                    if (confirm(`${allActive ? 'Désactiver' : 'Activer'} ${selectedMembers.size} membre${selectedMembers.size > 1 ? 's' : ''} ?`)) {
                      selectedMembers.forEach(id => {
                        const member = staff.find(m => m._id === id);
                        if (member) {
                          onToggleStatus(id, member.isActive);
                        }
                      });
                    }
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {Array.from(selectedMembers).every(id => staff.find(m => m._id === id)?.isActive)
                    ? 'Désactiver tous'
                    : 'Activer tous'}
                </button>
              )}
              
              {canDelete && (
                <button
                  onClick={() => {
                    if (confirm(`Supprimer ${selectedMembers.size} membre${selectedMembers.size > 1 ? 's' : ''} ?`)) {
                      selectedMembers.forEach(id => onDelete(id));
                    }
                  }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Supprimer tous
                </button>
              )}
              
              <button
                onClick={() => onSelectAll?.()}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Désélectionner tout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Message si aucun résultat */}
      {staff.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">Aucun membre trouvé</p>
          <p className="text-sm text-gray-400">
            {filters && (filters.role || filters.department || filters.status !== 'all')
              ? 'Essayez de modifier vos filtres'
              : 'Commencez par ajouter un membre'}
          </p>
        </div>
      )}
    </div>
  );
};

export default StaffTable;