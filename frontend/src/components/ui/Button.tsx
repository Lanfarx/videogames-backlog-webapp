import React from 'react';

interface ButtonProps {
  label: string;
  primary?: boolean;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ label, primary = true, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-md font-secondary text-sm ${
        primary
          ? 'bg-accent-primary text-white hover:bg-accent-primary/90'
          : 'bg-tertiaryBg text-text-secondary border border-border-color hover:text-accent-primary hover:border-accent-primary'
      }`}
    >
      {label}
    </button>
  );
};

export default Button;
