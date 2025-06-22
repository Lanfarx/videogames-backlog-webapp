import React from 'react';
import Toast, { ToastProps } from './Toast';

export interface ToastContainerProps {
  toasts: ToastProps[];
  onRemoveToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemoveToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            transform: `translateY(${index * 10}px)`,
            zIndex: 1000 - index,
          }}
        >
          <Toast
            {...toast}
            onClose={onRemoveToast}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
