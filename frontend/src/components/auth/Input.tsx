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
      <label className="block text-sm font-medium text-gray-900 mb-1">{label}</label>
      <div className="relative">
        <input
          className={`w-full h-12 px-4 pr-10 rounded-lg border text-base font-normal transition focus:outline-none focus:border-accent focus:shadow-[0_0_0_2px_rgba(251,126,0,0.2)] ${
            error
              ? 'border-error focus:border-error'
              : valid
              ? 'border-success focus:border-success'
              : 'border-gray-300'
          } ${props.type === 'password' ? 'pr-12' : ''}`}
          {...props}
        />
        {iconRight && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">{iconRight}</span>
        )}
      </div>
      {helpertext && !error && (
        <p className="text-xs text-gray-500 mt-1">{helpertext}</p>
      )}
      {error && (
        <p className="text-xs text-error mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;
