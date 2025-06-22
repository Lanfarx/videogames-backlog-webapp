import React from 'react';

interface PasswordStrengthBarProps {
  strength: 'debole' | 'media' | 'forte' | '';
}

const colorMap: Record<string, string> = {
  debole: 'bg-accent-danger', // usa la variabile css per danger
  media: 'bg-accent-secondary', // usa la variabile css per secondary/accent
  forte: 'bg-accent-success', // usa la variabile css per success
  '': '',
};

const widthMap: Record<string, string> = {
  debole: 'w-1/3',
  media: 'w-2/3',
  forte: 'w-full',
  '': 'w-0',
};

const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({ strength }) => (
  <div className="w-full h-1 rounded bg-gray-200 mt-1 mb-1">
    {strength !== '' && (
      <div
        className={`h-1 rounded transition-all duration-300 ${colorMap[strength]} ${widthMap[strength]}`}
      ></div>
    )}
  </div>
);

export default PasswordStrengthBar;
