import React from 'react';
import { ChevronRight, Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PreviewColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
}

interface PreviewTableProps {
  title: string;
  columns: PreviewColumn[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  onViewAll?: () => void;
  viewAllLink?: string;
  actions?: {
    view?: (id: string) => void;
    edit?: (id: string) => void;
    delete?: (id: string) => void;
  };
}

export function PreviewTable({
  title,
  columns,
  data,
  loading = false,
  emptyMessage = 'Aucune donnée',
  onViewAll,
  viewAllLink,
  actions,
}: PreviewTableProps) {
  const displayedData = data.slice(0, 5); // Afficher max 5 éléments

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* En-tête */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {viewAllLink ? (
          <Link
            to={viewAllLink}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Voir tout
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : onViewAll ? (
          <button
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Voir tout
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3 text-left font-medium text-gray-700 ${col.width || ''}`}
                >
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-3 text-left font-medium text-gray-700 w-12">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : displayedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              displayedData.map((row, idx) => (
                <tr key={row._id || idx} className="border-b border-gray-100 hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-3 text-gray-700">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        {actions.view && (
                          <button
                            onClick={() => actions.view?.(row._id)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Voir"
                          >
                            <Eye className="h-4 w-4 text-gray-600" />
                          </button>
                        )}
                        {actions.edit && (
                          <button
                            onClick={() => actions.edit?.(row._id)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </button>
                        )}
                        {actions.delete && (
                          <button
                            onClick={() => actions.delete?.(row._id)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pied de page */}
      {displayedData.length > 0 && data.length > 5 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          Affichage de {displayedData.length} sur {data.length} éléments
        </div>
      )}
    </div>
  );
}
