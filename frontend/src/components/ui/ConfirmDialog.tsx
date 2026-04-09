import React from 'react';

interface ConfirmDialogProps {
  open?: boolean;
  isOpen?: boolean;
  title?: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger' | 'warning';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
  open, 
  isOpen,
  title, 
  message, 
  onConfirm, 
  onCancel,
  onClose,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'default'
}) => {
  const isOpen_ = open ?? isOpen ?? false;
  const handleClose = onClose ?? onCancel;
  
  if (!isOpen_) return null;

  const bgColor = variant === 'danger' ? 'bg-red-500' : variant === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
        <p className="mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button 
            className="px-3 py-1 text-gray-600 border border-gray-300 rounded" 
            onClick={handleClose}
          >
            {cancelText}
          </button>
          <button 
            className="px-3 py-1 bg-red-600 text-white rounded" 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
