import React, { useState, useRef, useEffect } from 'react';
import { Grid, List, ChevronDown, ChevronUp, Check, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SORT_OPTIONS } from '../../constants/gameConstants'; // Importa le opzioni di ordinamento
import AddGameButton from '../ui/AddGameButton';
import { SortOption } from '../../types/game';
import { useAppSelector } from '../../store/hooks';
import SteamImportPanel from './SteamImportPanel';
import { useSteamSyncNow } from '../../hooks/useSteamAutoSync';
import { formatRelativeTime } from '../../utils/dateUtils';

interface LibraryToolbarProps {
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  onAddGame: () => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: SortOption) => void;
  searchQuery: string;
  onSearchChange?: (query: string) => void;
  columns?: number;
  onColumnsChange?: (columns: number) => void;
}

export default function LibraryToolbar({
  viewMode,
  setViewMode,
  onAddGame,
  sortBy,
  sortOrder,
  onSortChange,
  searchQuery,
  onSearchChange,
}: LibraryToolbarProps) {
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showSteamImport, setShowSteamImport] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const steamId = useAppSelector(state => state.user.profile?.steamId);
  const lastSteamSync = useAppSelector(state => state.user.profile?.lastSteamSyncAt);
  const steamPendingCount = useAppSelector(state => state.user.steamPendingCount);
  const { sync, syncing } = useSteamSyncNow();

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
      <div className="flex items-center gap-3">
        <AddGameButton onClick={onAddGame} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange && onSearchChange(e.target.value)}
          placeholder="Cerca nella libreria..."
          className="ml-2 px-3 py-1.5 rounded-md border border-border-color bg-primary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary text-sm w-96"
        />
      </div>      <div className="flex items-center space-x-6">
        {steamId ? (
          <div className="flex items-center gap-1 text-sm">
            <button
              type="button"
              className="relative flex items-center gap-2 p-2 rounded-md hover:bg-accent-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary"
              onClick={() => setShowSteamImport(true)}
              title="Giochi Steam da importare"
            >
              <span className="text-text-primary font-medium">Steam</span>
              <span className="text-text-secondary">· {lastSteamSync ? formatRelativeTime(lastSteamSync) : 'mai sincronizzato'}</span>
              {steamPendingCount > 0 && (
                <span className="ml-1 px-1.5 rounded-full bg-accent-primary text-white text-xs">{steamPendingCount} nuovi</span>
              )}
            </button>
            <button
              type="button"
              className="p-2 rounded-md text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 transition-colors disabled:opacity-50"
              onClick={() => sync(false)}
              disabled={syncing}
              aria-label="Sincronizza ora con Steam"
              title="Sincronizza ora"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        ) : (
          <Link to="/settings" className="text-sm text-text-secondary hover:text-accent-primary">Collega Steam</Link>
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
          </button>          {/* Dropdown menu */}
          {showSortDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-primary-bg border border-border-color rounded-md dropdown-dark-shadow z-30">
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
                      {sortBy === option.value && <Check className="h-4 w-4 text-accent-primary" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>)}
        </div>
      </div>
      <SteamImportPanel isOpen={showSteamImport} onClose={() => setShowSteamImport(false)} />
    </div>
  );
}