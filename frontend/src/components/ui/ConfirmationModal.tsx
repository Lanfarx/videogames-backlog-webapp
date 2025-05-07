import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText: string;
  cancelButtonText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText,
  cancelButtonText = 'Annulla',
  type = 'danger'
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  // Determina il colore del pulsante di conferma in base al tipo
  const buttonColorClass = {
    danger: 'bg-accent-danger hover:bg-accent-danger/90',
    warning: 'bg-accent-secondary hover:bg-accent-secondary/90',
    info: 'bg-accent-primary hover:bg-accent-primary/90'
  }[type];

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary-bg rounded-lg shadow-lg z-50 w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-primary font-bold text-text-primary mb-2">{title}</h3>
          <p className="text-text-secondary mb-6">{message}</p>
          
          <div className="flex justify-end space-x-3">
            <button
              className="px-4 py-2 border border-border-color rounded-lg text-text-primary hover:bg-secondary-bg transition-colors font-secondary"
              onClick={onClose}
            >
              {cancelButtonText}
            </button>
            <button
              className={`px-4 py-2 text-white rounded-lg ${buttonColorClass} transition-colors font-secondary`}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationModal;