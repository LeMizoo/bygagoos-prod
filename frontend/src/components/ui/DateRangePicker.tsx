import React, { useState } from 'react';

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  placeholder?: string;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  placeholder = 'Sélectionner une plage de dates',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [from, setFrom] = useState<string>(value?.from ? value.from.toISOString().split('T')[0] : '');
  const [to, setTo] = useState<string>(value?.to ? value.to.toISOString().split('T')[0] : '');

  const handleApply = () => {
    onChange?.({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
    setIsOpen(false);
  };

  const handleReset = () => {
    setFrom('');
    setTo('');
    onChange?.({});
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-gray-300 rounded bg-white text-left hover:bg-gray-50"
      >
        {from && to ? `${from} - ${to}` : placeholder}
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-2 bg-white border border-gray-300 rounded shadow-lg p-4 w-80">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">De:</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">À:</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={handleReset}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Réinitialiser
              </button>
              <button
                onClick={handleApply}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
