import React from 'react';

interface DesignSelectorProps {
  value?: string;
  options?: Array<{ value: string; label: string }>;
  onChange?: (value: string) => void;
}

export const DesignSelector: React.FC<DesignSelectorProps> = ({ value = '', options = [], onChange }) => {
  return (
    <div className="w-full">
      <select
        aria-label="Sélectionner un design"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2"
      >
        <option value="">Sélectionner un design</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <p className="text-xs text-gray-400 mt-1">(placeholder design selector)</p>
    </div>
  );
};
