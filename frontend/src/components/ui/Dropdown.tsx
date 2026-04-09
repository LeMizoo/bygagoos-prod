import React, { useState, useRef, useEffect } from 'react';

interface DropdownItem {
  label: string;
  value?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

interface DropdownProps {
  label?: string;
  options?: Array<{ label: string; value: string }>;
  onSelect?: (value: string) => void;
  trigger?: React.ReactNode;
  items?: DropdownItem[];
}

export const Dropdown: React.FC<DropdownProps> = ({ 
  label, 
  options, 
  onSelect, 
  trigger,
  items 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Menu mode (with items and trigger)
  if (trigger && items) {
    return (
      <div className="relative" ref={ref}>
        <div onClick={() => setIsOpen(!isOpen)}>
          {trigger}
        </div>
        {isOpen && (
          <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded shadow-lg z-10">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 ${item.className || ''}`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Select mode (with options)
  return (
    <select
      aria-label={label}
      onChange={(e) => onSelect?.(e.target.value)}
      className="border rounded px-2 py-1"
    >
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};
