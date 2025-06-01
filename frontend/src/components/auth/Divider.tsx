import React from 'react';

const Divider: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex items-center my-6">
    <div className="flex-grow h-px bg-gray-300" />
    {text && <span className="mx-4 text-sm text-gray-500">{text}</span>}
    <div className="flex-grow h-px bg-gray-300" />
  </div>
);

export default Divider;
