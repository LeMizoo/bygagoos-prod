import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: 'blue' | 'green';
  count?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  color = 'blue',
  count,
}) => {
  const percentage = Math.round((value / max) * 100);
  const colorClass = color === 'green' ? 'bg-green-600' : 'bg-blue-600';

  return (
    <div className="flex items-center gap-2">
      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} rounded-full progress-bar`}
          data-width={percentage}
        />
      </div>
      {count !== undefined && (
        <span className="text-sm font-medium text-gray-900">{count}</span>
      )}
    </div>
  );
};
