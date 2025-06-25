import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpertext?: string;
  valid?: boolean;
  iconRight?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helpertext,
  valid,
  iconRight,
  ...props
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-text-primary mb-1">{label}</label>
      <div className="relative">
        <input
          className={`w-full h-12 px-4 pr-10 rounded-lg border text-base font-normal transition focus:outline-none bg-primary-bg text-text-primary border-border-color focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/30 ${
            error
              ? 'border-accent-danger focus:border-accent-danger focus:ring-accent-danger/30'
              : valid
              ? 'border-accent-success focus:border-accent-success focus:ring-accent-success/30'
              : ''
          } ${props.type === 'password' ? 'pr-12' : ''}`}
          {...props}
        />
        {iconRight && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">{iconRight}</span>
        )}
      </div>
      {helpertext && !error && (
        <p className="text-xs text-text-secondary mt-1">{helpertext}</p>
      )}
      {error && (
        <p className="text-xs text-accent-danger mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;
