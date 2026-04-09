// frontend/src/components/admin/ExportModal.tsx
import React, { useState } from 'react';
import { X, FileText, FileSpreadsheet, File as FilePdf } from 'lucide-react';

interface ExportModalProps {
  onExport: (format: 'csv' | 'excel' | 'pdf') => void;
  onClose: () => void;
  selectedCount: number;
  totalCount: number;
}

export function ExportModal({ onExport, onClose, selectedCount, totalCount }: ExportModalProps) {
  const [format, setFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [includeSelected, setIncludeSelected] = useState(selectedCount > 0);

  const exportOptions = [
    { value: 'csv', label: 'CSV', icon: FileText, description: 'Format universel, compatible Excel' },
    { value: 'excel', label: 'Excel', icon: FileSpreadsheet, description: 'Format natif Excel (.xlsx)' },
    { value: 'pdf', label: 'PDF', icon: FilePdf, description: 'Format PDF imprimable' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Exporter les données</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Sélection des données à exporter */}
          {selectedCount > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Données à exporter
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!includeSelected}
                    onChange={() => setIncludeSelected(false)}
                    className="rounded-full"
                  />
                  <span>Toutes les données ({totalCount} lignes)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={includeSelected}
                    onChange={() => setIncludeSelected(true)}
                    className="rounded-full"
                  />
                  <span>Uniquement la sélection ({selectedCount} lignes)</span>
                </label>
              </div>
            </div>
          )}

          {/* Format d'export */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format d'export
            </label>
            <div className="grid grid-cols-3 gap-2">
              {exportOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFormat(opt.value as any)}
                  className={`p-3 border rounded-lg text-center ${
                    format === opt.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <opt.icon className={`w-6 h-6 mx-auto mb-1 ${
                    format === opt.value ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                  <span className={`text-sm ${
                    format === opt.value ? 'text-blue-600 font-medium' : 'text-gray-600'
                  }`}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Options supplémentaires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-gray-300" />
              <span>Inclure les en-têtes de colonnes</span>
            </label>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={() => onExport(format)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Exporter
          </button>
        </div>
      </div>
    </div>
  );
}