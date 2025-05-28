import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  loading,
  fullWidth,
  ...props
}) => (
  <button
    className={`h-12 px-6 rounded-lg font-medium text-base transition-colors bg-accent text-white hover:bg-accent-dark disabled:opacity-70 flex items-center justify-center ${
      fullWidth ? 'w-full' : ''
    }`}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading ? (
      <span className="animate-spin mr-2 w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
    ) : null}
    {loading ? 'Caricamento...' : children}
  </button>
);

export default Button;
