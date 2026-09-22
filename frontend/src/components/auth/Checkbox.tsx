import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Checkbox({ label, ...props }: CheckboxProps) { return (
  <label className="inline-flex items-center cursor-pointer text-sm text-gray-600">
    <input
      type="checkbox"
      className="form-checkbox accent-accent border-gray-300 rounded focus:ring-2 focus:ring-accent"
      {...props}
    />
    <span className="ml-2">{label}</span>
  </label>
); }
