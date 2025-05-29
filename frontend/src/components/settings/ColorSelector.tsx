import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCssVarColor } from '../../utils/getCssVarColor';
import { AccentColor } from '../../types/theme';
import { setUserProfile } from '../../store/slice/userSlice';

interface ColorSelectorProps {
  accentColor?: string;
  onChange?: (color: AccentColor) => void;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({ accentColor: propAccentColor, onChange }) => {
  const dispatch = useDispatch();
  const userProfile = useSelector((state: any) => state.user.profile);
  const currentAccentColor = propAccentColor || userProfile?.appPreferences?.accentColor || 'arancione';

  const handleColorChange = (color: AccentColor) => {
    if (onChange) onChange(color);
    // Aggiorna lo stato globale Redux
    if (userProfile) {
      dispatch(setUserProfile({
        ...userProfile,
        appPreferences: {
          ...userProfile.appPreferences,
          accentColor: color
        }
      }));
    }
  };

  const colorOptions = [
    { id: "arancione" as const, name: "Arancione", cssVar: "--accent-arancione" },
    { id: "blu" as const, name: "Blu", cssVar: "--accent-blu" },
    { id: "verde" as const, name: "Verde", cssVar: "--accent-verde" },
    { id: "rosso" as const, name: "Rosso", cssVar: "--accent-rosso" },
    { id: "viola" as const, name: "Viola", cssVar: "--accent-viola" },
  ];
  return (
    <div className="flex items-center space-x-3 p-2">
      {colorOptions.map((option) => {
        const colorValue = getCssVarColor(option.cssVar, '');
        return (
          <button
            key={option.id}
            className={`w-8 h-8 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary/30 border border-border-color hover:border-accent-primary/50 transition-all`}
            style={{ backgroundColor: colorValue || undefined }}
            onClick={() => handleColorChange(option.id)}
            title={option.name}
            aria-label={`Seleziona colore ${option.name}`}
            type="button"
          >
            {currentAccentColor === option.id && (
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
        );
      })}
    </div>
  );
};

export default ColorSelector;
