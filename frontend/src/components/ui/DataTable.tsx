import React from 'react';

export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, item: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  isLoading?: boolean;
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  onFilterChange?: (key: string, value: any) => void;
  onSearch?: (value: string) => void;
  onPageChange?: (page: number) => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export const DataTable = React.forwardRef<HTMLTableElement, DataTableProps<any>>(
  ({ data, columns, keyExtractor, isLoading, onSort, onFilterChange, onSearch, onPageChange, pagination }, ref) => {
    return (
      <div className="w-full overflow-x-auto">
        <table ref={ref} className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              {columns.map(col => (
                <th 
                  key={String(col.key)} 
                  className="px-4 py-2 text-left font-medium text-gray-700 cursor-pointer"
                  onClick={() => col.sortable && onSort?.(String(col.key), 'asc')}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-4 text-center text-gray-500">
                  Chargement...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-4 text-center text-gray-500">
                  Aucune donnée
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={keyExtractor(item, index)} className="border-b hover:bg-gray-50">
                  {columns.map(col => (
                    <td key={String(col.key)} className="px-4 py-2">
                      {col.render ? col.render(item[col.key], item) : String(item[col.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }
);

DataTable.displayName = 'DataTable';
