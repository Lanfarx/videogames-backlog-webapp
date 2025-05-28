import React, { useState, useRef, useEffect } from 'react';
import { Grid, List, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { SORT_OPTIONS } from '../../constants/gameConstants'; // Importa le opzioni di ordinamento
import AddGameButton from '../ui/AddGameButton';
import { SortOption } from '../../types/game';
import { loadFromLocal } from '../../utils/localStorage';
import { useAppDispatch } from '../../store/hooks';
import { addGame } from '../../store/slice/gamesSlice';
import { mapSteamGamesToLocal } from '../../utils/mapSteamGamesToLocal';

interface LibraryToolbarProps {
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  onAddGame: () => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: SortOption) => void;
  onSearchChange?: (query: string) => void;
  columns?: number;
  onColumnsChange?: (columns: number) => void;
}

const LibraryToolbar: React.FC<LibraryToolbarProps> = ({
  viewMode,
  setViewMode,
  onAddGame,
  sortBy,
  sortOrder,
  onSortChange,
  onSearchChange,
  columns,
  onColumnsChange
}) => {
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const [steamId, setSteamId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();

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

  useEffect(() => {
    setSteamId(loadFromLocal('steamId'));
  }, []);

  return (
    <div className="h-16 bg-primary-bg border-b border-border-color px-6 flex items-center justify-between relative">
      {/* Overlay trasparente per disabilitare i clic sulle card */}
      {showSortDropdown && (
        <div
          className="fixed inset-0 bg-transparent z-10"
          onClick={() => setShowSortDropdown(false)}
        ></div>
      )}
      <div className="flex items-center gap-3">
        <AddGameButton onClick={onAddGame} />
        <input
          type="text"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            onSearchChange && onSearchChange(e.target.value);
          }}
          placeholder="Cerca nella libreria..."
          className="ml-2 px-3 py-1.5 rounded-md border border-border-color bg-primary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary text-sm w-96"
        />
      </div>

      <div className="flex items-center space-x-6">
        {/* Icona import Steam, solo se steamId presente */}
        {steamId && (
          <div className="relative group flex items-center space-x-2">
            <button
              type="button"
              className="p-1.5 rounded-md hover:bg-accent-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary"
              style={{ background: 'var(--color-primary-bg)' }}
              onClick={async () => {
                setIsImporting(true);
                setImportError(null);
                try {
                  const mappedGames = await mapSteamGamesToLocal(steamId);
                  mappedGames.forEach(game => {
                    dispatch(addGame(game));
                  });
                  alert(`Importazione completata! Giochi aggiunti: ${mappedGames.length}`);
                } catch (err: any) {
                  setImportError('Errore durante l\'importazione da Steam.');
                } finally {
                  setIsImporting(false);
                }
              }}
              aria-label="Importa giochi da Steam"
              disabled={isImporting}
            >
              {isImporting ? (
                <span className="loader mr-2" />
              ) : null}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path fill="var(--color-accent-primary, #60a5fa)" d="M12 16.5a1 1 0 0 1-1-1V9.91l-2.29 2.3a1 1 0 1 1-1.42-1.42l4-4a1 1 0 0 1 1.42 0l4 4a1 1 0 1 1-1.42 1.42L13 9.91v5.59a1 1 0 0 1-1 1Z"/>
                <path fill="var(--color-accent-primary, #60a5fa)" d="M6 18a1 1 0 1 1 0-2h12a1 1 0 1 1 0 2H6Z"/>
              </svg>
            </button>
            <span className="text-xs font-medium select-none" style={{ color: 'var(--color-text-primary)' }}>Importa da Steam</span>
            <div className="absolute hidden group-hover:block w-56 p-2 bg-slate-700 text-white text-xs rounded-lg top-8 left-1/2 -translate-x-1/2 shadow-lg z-20">
              <p className="mb-0">Importa i tuoi giochi da Steam nella libreria</p>
            </div>
            {importError && (
              <span className="text-xs text-accent-danger ml-2">{importError}</span>
            )}
          </div>
        )}

        <div className="flex items-center space-x-2">
          {/* Visualizzazione griglia/lista */}
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