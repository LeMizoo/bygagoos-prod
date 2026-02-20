// frontend/src/components/admin/StaffTable.tsx
import { Link } from "react-router-dom";
import { Edit, Trash2, User, UserCheck, UserX, Eye } from "lucide-react";
import { StaffMember } from "../../api/adminStaff.api";

interface StaffTableProps {
  staff: StaffMember[];
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

export default function StaffTable({
  staff,
  onDelete,
  onToggleStatus,
}: StaffTableProps) {
  // Validation des données
  if (!staff || !Array.isArray(staff)) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Données invalides
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Les données du personnel sont corrompues ou indisponibles.
        </p>
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun membre</h3>
        <p className="mt-1 text-sm text-gray-500">
          Aucun membre du personnel n'a été trouvé.
        </p>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR");
    } catch {
      return "Date invalide";
    }
  };

  const getRoleBadgeColor = (role: string) => {
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
      STAFF: "bg-gray-100 text-gray-800",
      ADMIN: "bg-blue-100 text-blue-800",
      MANAGER: "bg-indigo-100 text-indigo-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const getDepartmentBadgeColor = (department?: string) => {
    if (!department) return "bg-gray-50 text-gray-700 border-gray-200";

    const colors: Record<string, string> = {
      INSPIRATION: "bg-pink-50 text-pink-700 border-pink-200",
      PRODUCTION: "bg-blue-50 text-blue-700 border-blue-200",
      COMMUNICATION: "bg-green-50 text-green-700 border-green-200",
      ADMINISTRATION: "bg-purple-50 text-purple-700 border-purple-200",
      LOGISTIQUE: "bg-orange-50 text-orange-700 border-orange-200",
      CREATION: "bg-teal-50 text-teal-700 border-teal-200",
      SALES: "bg-red-50 text-red-700 border-red-200",
      MANAGEMENT: "bg-indigo-50 text-indigo-700 border-indigo-200",
    };
    return colors[department] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getDisplayName = (member: StaffMember) => {
    if (member.displayName && member.displayName.trim()) {
      return member.displayName;
    }
    return (
      `${member.firstName || ""} ${member.lastName || ""}`.trim() ||
      "Nom inconnu"
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Membre
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Rôle & Département
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Responsabilités
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
            {staff.map((member) => (
              <tr
                key={member._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {member.avatar ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={member.avatar}
                          alt={getDisplayName(member)}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                            const parent = (e.target as HTMLImageElement)
                              .parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                              `;
                            }
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {getDisplayName(member)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {member.email || member.user?.email || "Non associé"}
                      </div>
                      <div className="text-xs text-gray-400">
                        Depuis: {formatDate(member.joinedAt)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}
                    >
                      {member.role.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDepartmentBadgeColor(member.department)}`}
                    >
                      {member.department || "Non spécifié"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {member.responsibilities &&
                    member.responsibilities.length > 0 ? (
                      <>
                        {member.responsibilities
                          .slice(0, 3)
                          .map((resp, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                              title={resp}
                            >
                              {resp.length > 15
                                ? resp.substring(0, 15) + "..."
                                : resp}
                            </span>
                          ))}
                        {member.responsibilities.length > 3 && (
                          <span
                            className="text-xs text-gray-500"
                            title={member.responsibilities.slice(3).join(", ")}
                          >
                            +{member.responsibilities.length - 3} autres
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">
                        Aucune responsabilité
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onToggleStatus(member._id, !member.isActive)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      member.isActive
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }`}
                    title={`Cliquer pour ${member.isActive ? "désactiver" : "activer"}`}
                  >
                    {member.isActive ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-1" />
                        Actif
                      </>
                    ) : (
                      <>
                        <UserX className="h-4 w-4 mr-1" />
                        Inactif
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link
                      to={`/admin/staff/${member._id}`}
                      className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                      title="Voir les détails"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/admin/staff/edit/${member._id}`}
                      className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onDelete(member._id)}
                      className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
