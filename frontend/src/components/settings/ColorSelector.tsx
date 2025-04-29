import React from 'react';
import { useTheme } from '../../contexts/theme-context';

const ColorSelector: React.FC = () => {
  const { accentColor, setAccentColor } = useTheme();
  
  const colorOptions = [
    { id: "arancione" as const, name: "Arancione", color: "#FB7E00" },
    { id: "blu" as const, name: "Blu", color: "#2D7FF9" },
    { id: "verde" as const, name: "Verde", color: "#10B981" },
    { id: "rosso" as const, name: "Rosso", color: "#EF4444" },
    { id: "viola" as const, name: "Viola", color: "#8B5CF6" },
  ];

  return (
    <div className="flex items-center justify-between py-4">
      <span className="font-secondary text-base text-text-secondary">Colore accent</span>
      <div className="flex space-x-3">
        {colorOptions.map((option) => (
          <button
            key={option.id}
            className={`w-8 h-8 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary/30`}
            style={{ backgroundColor: option.color }}
            onClick={() => setAccentColor(option.id)}
            title={option.name}
            aria-label={`Seleziona colore ${option.name}`}
          >
            {accentColor === option.id && (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="h-4 w-4 text-white"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorSelector;
