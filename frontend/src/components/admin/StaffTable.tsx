// frontend/src/components/admin/StaffTable.tsx
import React from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  MoreVertical,
  User,
  Shield,
} from "lucide-react";
import { StaffMember } from "../../api/adminStaff.api";
import { formatDate } from "../../utils/formatters";
import { Avatar } from "../ui/Avatar";

export interface StaffTableProps {
  staff: StaffMember[];
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  selectedStaff?: Set<string>;
  onSelectStaff?: (id: string) => void;
  onSelectAll?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  loading?: boolean;
}

const StaffTable: React.FC<StaffTableProps> = ({
  staff,
  onDelete,
  onToggleStatus,
  selectedStaff = new Set(),
  onSelectStaff,
  onSelectAll,
  canEdit = true,
  canDelete = true,
  onRefresh,
  onExport,
  loading = false,
}) => {
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null);

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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {onSelectStaff && onSelectAll && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedStaff.size === staff.length && staff.length > 0}
                    onChange={onSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Membre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Rôle</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Département</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Statut</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date d'embauche</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <React.Fragment key={member._id}>
                <tr 
                  className={`border-t border-gray-200 hover:bg-gray-50 transition-colors ${
                    expandedRow === member._id ? 'bg-blue-50' : ''
                  }`}
                >
                  {onSelectStaff && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedStaff.has(member._id!)}
                        onChange={() => onSelectStaff(member._id!)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}

                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <Avatar
                        src={member.avatar}
                        name={`${member.firstName || ''} ${member.lastName || ''}`.trim() || member.displayName || member.email || 'Staff'}
                        size="md"
                        className="shadow-sm"
                      />
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{member.position || member.role}</p>
                      </div>
                    </div>
                  </td>

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

                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-900">{member.role}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-700">
                    {member.department ? (
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                        {member.department}
                      </div>
                    ) : '-'}
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() => onToggleStatus(member._id!, member.isActive)}
                      disabled={!canEdit}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        member.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } ${!canEdit ? 'cursor-not-allowed opacity-50' : ''}`}
                      title={canEdit ? "Cliquer pour changer le statut" : "Permission refusée"}
                    >
                      {member.isActive ? 'Actif' : 'Inactif'}
                    </button>
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-600">
                    {member.hireDate ? (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(member.hireDate)}
                      </div>
                    ) : '-'}
                  </td>

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

                      <button
                        onClick={() => setExpandedRow(expandedRow === member._id ? null : member._id!)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                {expandedRow === member._id && (
                  <tr className="bg-blue-50 border-t border-blue-200 lg:hidden">
                    <td colSpan={onSelectStaff ? 8 : 7} className="px-4 py-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Informations</p>
                          <p className="text-gray-600">Email: {member.email || '-'}</p>
                          <p className="text-gray-600">Tél: {member.phone || '-'}</p>
                          <p className="text-gray-600">Rôle: {member.role || '-'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Détails</p>
                          <p className="text-gray-600">Département: {member.department || '-'}</p>
                          <p className="text-gray-600">Poste: {member.position || '-'}</p>
                          <p className="text-gray-600">Date d'embauche: {member.hireDate ? formatDate(member.hireDate) : '-'}</p>
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

      {staff.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Aucun membre du personnel trouvé</p>
        </div>
      )}
    </div>
  );
};

export default StaffTable;
