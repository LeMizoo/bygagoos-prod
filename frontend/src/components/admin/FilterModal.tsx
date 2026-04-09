// frontend/src/components/admin/FilterModal.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'boolean';
  options?: { value: any; label: string }[];
}

interface FilterModalProps {
  filters: FilterField[];
  onApply: (filters: Record<string, any>) => void;
  onClose: () => void;
  currentFilters: Record<string, any>;
}

export function FilterModal({ filters, onApply, onClose, currentFilters }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState(currentFilters);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Filtres avancés</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {filters.map(filter => (
            <div key={filter.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {filter.label}
              </label>
              
              {filter.type === 'text' && (
                <input
                  type="text"
                  value={localFilters[filter.key] || ''}
                  onChange={e => setLocalFilters({ ...localFilters, [filter.key]: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              )}

              {filter.type === 'select' && filter.options && (
                <select
                  value={localFilters[filter.key] || ''}
                  onChange={e => setLocalFilters({ ...localFilters, [filter.key]: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Tous</option>
                  {filter.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              )}

              {filter.type === 'date' && (
                <input
                  type="date"
                  value={localFilters[filter.key] || ''}
                  onChange={e => setLocalFilters({ ...localFilters, [filter.key]: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              )}

              {filter.type === 'boolean' && (
                <select
                  value={localFilters[filter.key] ?? ''}
                  onChange={e => setLocalFilters({ 
                    ...localFilters, 
                    [filter.key]: e.target.value === 'true' ? true : e.target.value === 'false' ? false : ''
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Tous</option>
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={handleClear}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Effacer tout
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
}