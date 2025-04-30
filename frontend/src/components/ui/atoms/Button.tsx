import React, { ReactNode } from 'react';

interface ButtonProps {
  label: string;
  primary?: boolean;
  onClick: () => void;
  icon?: ReactNode;
  className?: string; // Aggiungiamo questa prop
}

const Button: React.FC<ButtonProps> = ({ label, primary = true, onClick, icon, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-5 py-2.5 rounded-md font-secondary text-sm ${
        primary
          ? 'bg-accent-primary text-white'
          : 'bg-tertiaryBg text-text-secondary border border-border-color hover:text-accent-primary hover:border-accent-primary'
      } ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </button>
  );
};

export default Button;
