import React from 'react';

interface PasswordStrengthBarProps {
  strength: 'debole' | 'media' | 'forte';
}

const colorMap = {
  debole: 'bg-accent',
  media: 'bg-yellow-400',
  forte: 'bg-success',
};

const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({ strength }) => (
  <div className="w-full h-1 rounded bg-gray-200 mt-1 mb-1">
    <div
      className={`h-1 rounded ${colorMap[strength]}`}
      style={{ width: strength === 'debole' ? '33%' : strength === 'media' ? '66%' : '100%' }}
    ></div>
  </div>
);

export default PasswordStrengthBar;
