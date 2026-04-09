// frontend/src/hooks/useDataTable.ts
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface UseDataTableProps<T> {
  queryKey: string[];
  fetchFn: () => Promise<T[]>;
  createFn?: (data: Partial<T>) => Promise<T>;
  updateFn?: (id: string, data: Partial<T>) => Promise<T>;
  deleteFn?: (id: string) => Promise<void>;
  bulkDeleteFn?: (ids: string[]) => Promise<void>;
}

export function useDataTable<T extends { _id?: string; id?: string }>({
  queryKey,
  fetchFn,
  createFn,
  updateFn,
  deleteFn,
  bulkDeleteFn
}: UseDataTableProps<T>) {
  const queryClient = useQueryClient();
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});

  // Requête principale
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: fetchFn,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createFn!,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<T> }) => 
      updateFn!(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFn!,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setSelectedRows(prev => {
        const newSelection = new Set(prev);
        // Retirer les IDs supprimés de la sélection
        return newSelection;
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteFn!,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setSelectedRows(new Set());
    },
  });

  // Filtrage et recherche
  const filteredData = useCallback(() => {
    if (!data) return [];
    
    return data.filter(item => {
      // Recherche globale
      if (searchTerm) {
        const matchesSearch = Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (!matchesSearch) return false;
      }

      // Filtres
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = item[key as keyof T];
        if (typeof value === 'string') {
          return String(itemValue).toLowerCase().includes(value.toLowerCase());
        }
        return itemValue === value;
      });
    });
  }, [data, searchTerm, filters]);

  // Actions de sélection
  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  };

  const toggleAllRows = () => {
    if (!data) return;
    if (selectedRows.size === filteredData().length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredData().map(item => item._id || item.id || '')));
    }
  };

  const clearSelection = () => setSelectedRows(new Set());

  // Actions groupées
  const bulkDelete = async () => {
    if (!bulkDeleteFn) return;
    const ids = Array.from(selectedRows);
    await bulkDeleteFn(ids);
  };

  return {
    // Données
    data: filteredData(),
    allData: data,
    isLoading,
    error,
    
    // Recherche et filtres
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    clearFilters: () => setFilters({}),
    
    // Sélection
    selectedRows,
    toggleRowSelection,
    toggleAllRows,
    clearSelection,
    hasSelection: selectedRows.size > 0,
    selectedCount: selectedRows.size,
    
    // Mutations
    createItem: createMutation.mutate,
    updateItem: (id: string, data: Partial<T>) => updateMutation.mutate({ id, data }),
    deleteItem: deleteMutation.mutate,
    bulkDelete: bulkDeleteFn ? bulkDelete : undefined,
    
    // États des mutations
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
  };
}