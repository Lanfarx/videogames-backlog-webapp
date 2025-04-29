import React from 'react';

interface DropdownProps {
  label: string;
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options = [], selected, onChange }) => {
  // Verifica che options sia un array valido
  const validOptions = Array.isArray(options) ? options : [];
  
  // Se l'array è vuoto, aggiungi almeno un'opzione predefinita
  const displayOptions = validOptions.length > 0 ? validOptions : ['Opzione predefinita'];
  
  // Assicurati che selected sia un valore valido
  const validSelected = displayOptions.includes(selected) ? selected : displayOptions[0];
  
  return (
    <div className="flex items-center justify-between py-4">
      <span className="font-secondary text-base text-text-secondary">{label}</span>
      <div className="relative">
        <select
          value={validSelected}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none min-w-[200px] rounded-md bg-tertiaryBg border border-border-color py-2 px-4 pr-8 text-base font-secondary text-text-secondary focus:outline-none"
        >
          {displayOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
          <svg className="h-4 w-4 fill-current text-text-secondary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
