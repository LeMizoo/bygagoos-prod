import React from 'react';

interface ClientSearchProps {
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (client: any) => void;
}

export const ClientSearch: React.FC<ClientSearchProps> = ({ value = '', onChange }) => {
  return (
    <div className="w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2"
        placeholder="Rechercher un client..."
      />
      <p className="text-xs text-gray-400 mt-1">(placeholder client search)</p>
    </div>
  );
};
