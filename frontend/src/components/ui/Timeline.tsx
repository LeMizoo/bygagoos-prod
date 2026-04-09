import React from 'react';

export interface TimelineItem {
  id: string;
  label: string;
  timestamp?: string;
  content?: React.ReactNode;
  status?: 'completed' | 'pending' | 'active';
  icon?: React.ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              item.status === 'completed' ? 'bg-green-500' :
              item.status === 'active' ? 'bg-blue-500' :
              'bg-gray-300'
            } text-white`}>
              {item.icon || (index + 1)}
            </div>
            {index < items.length - 1 && (
              <div className="w-0.5 h-12 bg-gray-300 my-2" />
            )}
          </div>
          <div className="pb-4">
            <h4 className="font-medium">{item.label}</h4>
            {item.timestamp && (
              <p className="text-sm text-gray-500">{item.timestamp}</p>
            )}
            {item.content && (
              <div className="mt-2 text-sm text-gray-700">{item.content}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
