// frontend/src/components/admin/DataTable.tsx
import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  HeaderGroup,
  Header,
  Row,
  Cell
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, Search, Download, Filter, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { ExportModal } from './ExportModal';
import { FilterModal } from './FilterModal';
import { dev } from '../../utils/devLogger';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  title: string;
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  exportOptions?: {
    fileName: string;
    fields: { key: string; label: string }[];
  };
  filters?: {
    key: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'boolean';
    options?: { value: unknown; label: string }[];
  }[];
}

export function DataTable<T extends { _id?: string; id?: string }>({
  data,
  columns,
  title,
  onAdd,
  onEdit,
  onDelete,
  onView,
  exportOptions,
  filters = []
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [columnFilters, setColumnFilters] = useState<Record<string, unknown>>({});
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Configuration de la table
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Filtrer les données
  const filteredData = useMemo(() => {
    return data.filter(item => {
      return Object.entries(columnFilters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = item[key as keyof T];
        if (typeof value === 'string') {
          return String(itemValue).toLowerCase().includes(value.toLowerCase());
        }
        if (value instanceof Date && itemValue instanceof Date) {
          return itemValue.toDateString() === value.toDateString();
        }
        return itemValue === value;
      });
    });
  }, [data, columnFilters]);

  // Sélection multiple
  const toggleRowSelection = (id: string) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRows(newSelection);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === filteredData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredData.map(item => item._id || item.id || '')));
    }
  };

  // Export des données
  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    if (!exportOptions) return;

    const dataToExport = selectedRows.size > 0
      ? filteredData.filter(item => selectedRows.has(item._id || item.id || ''))
      : filteredData;

    exportData(dataToExport, exportOptions.fields, format, exportOptions.fileName);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* En-tête avec actions */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex gap-2">
          {/* Barre de recherche globale */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <label htmlFor="datatable-search" className="sr-only">Rechercher</label>
            <input
              id="datatable-search"
              type="text"
              placeholder="Rechercher..."
              aria-label="Rechercher"
              title="Rechercher"
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Boutons d'action */}
          {filters.length > 0 && (
            <button
              onClick={() => setShowFilterModal(true)}
              className="px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtres
              {Object.keys(columnFilters).length > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {Object.keys(columnFilters).length}
                </span>
              )}
            </button>
          )}

          {exportOptions && (
            <button
              onClick={() => setShowExportModal(true)}
              className="px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter
              {selectedRows.size > 0 && (
                <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {selectedRows.size}
                </span>
              )}
            </button>
          )}

          {onAdd && (
            <button
              onClick={onAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          )}
        </div>
      </div>

      {/* Filtres actifs */}
      {Object.keys(columnFilters).length > 0 && (
        <div className="px-4 py-2 bg-blue-50 border-b flex flex-wrap gap-2">
          {Object.entries(columnFilters).map(([key, value]) => {
            const filter = filters.find(f => String(f.key) === key);
            return (
              <span key={key} className="bg-white px-3 py-1 rounded-full text-sm flex items-center gap-1 border">
                {filter?.label || key}: <strong>{String(value)}</strong>
                <button
                  onClick={() => setColumnFilters(prev => {
                    const newFilters = { ...prev };
                    delete newFilters[key];
                    return newFilters;
                  })}
                  className="ml-1 text-gray-500 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            );
          })}
          <button
            onClick={() => setColumnFilters({})}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Tout effacer
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<T>) => (
              <tr key={headerGroup.id}>
                {/* Case à cocher pour sélection multiple */}
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    aria-label="Sélectionner tout"
                    title="Sélectionner tout"
                    checked={selectedRows.size === filteredData.length && filteredData.length > 0}
                    onChange={toggleAllRows}
                    className="rounded border-gray-300"
                  />
                </th>
                
                {headerGroup.headers.map((header: Header<T, unknown>) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() && (
                        header.column.getIsSorted() === 'asc' 
                          ? <ChevronUp className="w-4 h-4" />
                          : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                ))}
                
                {/* Colonne actions */}
                {(onView || onEdit || onDelete) && (
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                )}
              </tr>
            ))}
          </thead>
          
          <tbody>
            {table.getRowModel().rows.map((row: Row<T>) => (
              <tr key={row.id} className="border-t hover:bg-gray-50">
                {/* Checkbox */}
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label={`Sélectionner la ligne ${row.id}`}
                    title={`Sélectionner la ligne ${row.id}`}
                    checked={selectedRows.has(row.original._id || row.original.id || '')}
                    onChange={() => toggleRowSelection(row.original._id || row.original.id || '')}
                    className="rounded border-gray-300"
                  />
                </td>
                
                {/* Données */}
                {row.getVisibleCells().map((cell: Cell<T, unknown>) => (
                  <td key={cell.id} className="px-4 py-3 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                
                {/* Actions */}
                {(onView || onEdit || onDelete) && (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {onView && (
                        <button
                          onClick={() => onView(row.original)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row.original)}
                          className="text-green-600 hover:text-green-800"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row.original)}
                          className="text-red-600 hover:text-red-800"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {table.getFilteredRowModel().rows.length} résultat(s)
          {selectedRows.size > 0 && ` (${selectedRows.size} sélectionné(s))`}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Précédent
          </button>
          <span className="px-3 py-1">
            Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>

      {/* Modals */}
      {showFilterModal && (
        <FilterModal
          filters={filters}
          onApply={setColumnFilters}
          onClose={() => setShowFilterModal(false)}
          currentFilters={columnFilters}
        />
      )}

      {showExportModal && (
        <ExportModal
          onExport={handleExport}
          onClose={() => setShowExportModal(false)}
          selectedCount={selectedRows.size}
          totalCount={filteredData.length}
        />
      )}
    </div>
  );
}

// Fonction d'export
function exportData(data: unknown[], fields: { key: string; label: string }[], format: string, fileName: string) {
  const formattedData = data.map(item => {
    const row: Record<string, unknown> = {};
    const src = item as Record<string, unknown>;
    fields.forEach(field => {
      row[field.label] = src[field.key];
    });
    return row;
  });

  if (format === 'csv') {
    const csv = convertToCSV(formattedData);
    downloadFile(csv, `${fileName}.csv`, 'text/csv');
  } else if (format === 'excel') {
    // Utiliser SheetJS ou similaire
    dev.log('Export Excel à implémenter');
  } else if (format === 'pdf') {
    // Utiliser jsPDF ou similaire
    dev.log('Export PDF à implémenter');
  }
}

function convertToCSV(data: unknown[]): string {
  if (data.length === 0) return '';
  const first = data[0] as Record<string, unknown>;
  const headers = Object.keys(first || {});
  const rows = data.map(r => {
    const row = r as Record<string, unknown>;
    return headers.map(header => JSON.stringify(row[header])).join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}