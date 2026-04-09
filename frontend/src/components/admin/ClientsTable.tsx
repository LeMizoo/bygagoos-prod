// frontend/src/components/admin/ClientsTable.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  MoreVertical,
  Download,
  RefreshCw,
  User,
} from "lucide-react";
import { Client } from "../../types/client";
import { formatDate } from "../../utils/formatters";

interface ClientsTableProps {
  clients: Client[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  selectedClients?: Set<string>;
  onSelectClient?: (id: string) => void;
  onSelectAll?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  loading?: boolean;
  filters?: {
    city?: string;
    status?: 'all' | 'active' | 'inactive';
    onCityChange?: (city: string) => void;
    onStatusChange?: (status: 'all' | 'active' | 'inactive') => void;
    cityOptions?: string[];
  };
}

// Type guard pour vérifier si une clé existe dans Client
type ClientKey = keyof Client;

const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  onDelete,
  onEdit,
  selectedClients = new Set(),
  onSelectClient,
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
    key: ClientKey;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Fonction de tri sécurisée
  const sortedClients = React.useMemo(() => {
    if (!sortConfig) return clients;

    return [...clients].sort((a, b) => {
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
  }, [clients, sortConfig]);

  const handleSort = (key: ClientKey) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (key: ClientKey) => {
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
            <Building2 className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Liste des clients ({clients.length})
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filtres */}
            {filters && (
              <>
                {filters.cityOptions && filters.cityOptions.length > 0 && (
                  <select
                    value={filters.city || ''}
                    onChange={(e) => filters.onCityChange?.(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Toutes les villes</option>
                    {filters.cityOptions.map(city => (
                      <option key={city} value={city}>{city}</option>
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

            {onExport && clients.length > 0 && (
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
              {/* Case à cocher */}
              {onSelectClient && onSelectAll && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedClients.size === clients.length && clients.length > 0}
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
                  Client {getSortIcon('firstName')}
                </div>
              </th>
              
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Contact
              </th>
              
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('company')}
              >
                <div className="flex items-center gap-1">
                  Entreprise {getSortIcon('company')}
                </div>
              </th>
              
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('city')}
              >
                <div className="flex items-center gap-1">
                  Ville {getSortIcon('city')}
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
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center gap-1">
                  Date d'inscription {getSortIcon('createdAt')}
                </div>
              </th>
              
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedClients.map((client) => (
              <React.Fragment key={client._id}>
                <tr 
                  className={`border-t border-gray-200 hover:bg-gray-50 transition-colors ${
                    expandedRow === client._id ? 'bg-blue-50' : ''
                  }`}
                >
                  {/* Checkbox */}
                  {onSelectClient && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedClients.has(client._id!)}
                        onChange={() => onSelectClient(client._id!)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}

                  {/* Client */}
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium shadow-sm">
                        {client.firstName?.[0] || ''}{client.lastName?.[0] || ''}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">
                          {client.firstName} {client.lastName}
                        </p>
                        {client.company && (
                          <p className="text-sm text-gray-500 flex items-center">
                            <Building2 className="h-3 w-3 mr-1" />
                            {client.company}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {client.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                          <span className="truncate max-w-[150px]">{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                          {client.phone}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Entreprise */}
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {client.company ? (
                      <div className="flex items-center">
                        <Building2 className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                        {client.company}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  {/* Ville */}
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {client.city ? (
                      <div className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                        {client.city}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  {/* Statut */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      client.isActive === true
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {client.isActive === true ? 'Actif' : 'Inactif'}
                    </span>
                  </td>

                  {/* Date d'inscription */}
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {client.createdAt ? (
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                        {formatDate(client.createdAt)}
                      </div>
                    ) : '-'}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        to={`/admin/clients/${client._id}`}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      
                      {canEdit && (
                        <button
                          onClick={() => onEdit(client._id!)}
                          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      
                      {canDelete && (
                        <button
                          onClick={() => onDelete(client._id!)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}

                      {/* Bouton pour développer/réduire */}
                      <button
                        onClick={() => setExpandedRow(expandedRow === client._id ? null : client._id!)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Ligne détaillée (mobile/tablette) */}
                {expandedRow === client._id && (
                  <tr className="bg-blue-50 border-t border-blue-200 lg:hidden">
                    <td colSpan={onSelectClient ? 8 : 7} className="px-4 py-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Informations</p>
                          <p className="text-gray-600">Email: {client.email || '-'}</p>
                          <p className="text-gray-600">Tél: {client.phone || '-'}</p>
                          <p className="text-gray-600">Entreprise: {client.company || '-'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Détails</p>
                          <p className="text-gray-600">Ville: {client.city || '-'}</p>
                          <p className="text-gray-600">Adresse: {client.address || '-'}</p>
                          <p className="text-gray-600">Code postal: {client.postalCode || '-'}</p>
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
            {selectedClients.size > 0 ? (
              <span className="font-medium text-blue-600">
                {selectedClients.size} client{selectedClients.size > 1 ? 's' : ''} sélectionné{selectedClients.size > 1 ? 's' : ''}
              </span>
            ) : (
              <span>{clients.length} client{clients.length > 1 ? 's' : ''} au total</span>
            )}
          </div>
          
          {selectedClients.size > 0 && canDelete && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (confirm(`Supprimer ${selectedClients.size} client${selectedClients.size > 1 ? 's' : ''} ?`)) {
                    selectedClients.forEach(id => onDelete(id));
                  }
                }}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Supprimer tous
              </button>
              
              {onSelectAll && (
                <button
                  onClick={onSelectAll}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Désélectionner tout
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Message si aucun résultat */}
      {clients.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">Aucun client trouvé</p>
          <p className="text-sm text-gray-400">
            {filters && (filters.city || filters.status !== 'all')
              ? 'Essayez de modifier vos filtres'
              : 'Commencez par ajouter un client'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientsTable;