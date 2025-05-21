import React, { useState, useRef, useEffect } from 'react';
import { Grid, List, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { SORT_OPTIONS } from '../../constants/gameConstants'; // Importa le opzioni di ordinamento
import AddGameButton from '../ui/AddGameButton';
import { SortOption } from '../../types/game';

interface LibraryToolbarProps {
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  onAddGame: () => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: SortOption) => void;
}

const LibraryToolbar: React.FC<LibraryToolbarProps> = ({
  viewMode,
  setViewMode,
  onAddGame,
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Chiudi il dropdown quando si clicca fuori
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Ottieni l'etichetta dell'ordinamento corrente
  const currentSortLabel = SORT_OPTIONS.find((option) => option.value === sortBy)?.label || "Titolo";

  return (
    <div className="h-16 bg-primary-bg border-b border-border-color px-6 flex items-center justify-between relative">
      {/* Overlay trasparente per disabilitare i clic sulle card */}
      {showSortDropdown && (
        <div
          className="fixed inset-0 bg-transparent z-10"
          onClick={() => setShowSortDropdown(false)}
        ></div>
      )}

      <AddGameButton onClick={onAddGame} />

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <button
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "grid" ? "text-accent-primary" : "text-text-secondary hover:text-accent-primary"
            }`}
            onClick={() => setViewMode("grid")}
            aria-label="Visualizzazione a griglia"
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "list" ? "text-accent-primary" : "text-text-secondary hover:text-accent-primary"
            }`}
            onClick={() => setViewMode("list")}
            aria-label="Visualizzazione a lista"
          >
            <List className="h-5 w-5" />
          </button>
        </div>

        <div className="relative z-20" ref={dropdownRef}>
          <button
            className="flex items-center font-roboto text-sm text-text-primary hover:text-accent-primary transition-colors"
            onClick={() => setShowSortDropdown(!showSortDropdown)}
          >
            Ordina per: {currentSortLabel}
            {sortOrder === "asc" ? (
              <ChevronUp className="h-4 w-4 ml-1 text-text-secondary" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-1 text-text-secondary" />
            )}
          </button>

          {/* Dropdown menu */}
          {showSortDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-border-color rounded-md shadow-lg z-30">
              <ul className="py-1">
                {SORT_OPTIONS.map((option) => (
                  <li key={option.value}>
                    <button
                      className="flex items-center justify-between w-full px-4 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white transition-colors"
                      onClick={() => {
                        onSortChange(option.value as SortOption);
                        setShowSortDropdown(false);
                      }}
                    >
                      {option.label}
                      {sortBy === option.value && <Check className="h-4 w-4 text-white" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryToolbar;