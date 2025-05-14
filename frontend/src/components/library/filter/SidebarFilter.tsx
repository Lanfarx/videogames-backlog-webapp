import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Calendar, Award } from 'lucide-react';
import { GameFilters, GameStatus } from '../../../types/game';
import { calculateCounts, calculateMaxValues } from '../../../utils/gameUtils';
import { STATUS_OPTIONS } from '../../../constants/gameConstants';

// Interfaccia per i props del componente
interface SidebarFilterProps {
  filters: GameFilters;
  setFilters: React.Dispatch<React.SetStateAction<GameFilters>>;
  gamesCount: number;
  games: any[]; // Aggiunto per accedere ai dati di games
}

const SidebarFilter: React.FC<SidebarFilterProps> = ({ filters, setFilters, gamesCount, games }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    status: true,
    platform: true,
    genre: true,
    price: true,
    hours: true,
    metacritic: true,
    date: true,
  });

  // Calcola i conteggi per ogni filtro
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [platformCounts, setPlatformCounts] = useState<Record<string, number>>({});
  const [genreCounts, setGenreCounts] = useState<Record<string, number>>({});

  // Calcola i valori massimi per i range
  const [maxPrice, setMaxPrice] = useState(70);
  const [maxHours, setMaxHours] = useState(100);
  const [maxMetacritic, setMaxMetacritic] = useState(100);

  useEffect(() => {
    // Calcola i conteggi reali dai dati di games
    const { statusCountsTemp, platformCountsTemp, genreCountsTemp } = calculateCounts(games);
    setStatusCounts(statusCountsTemp);
    setPlatformCounts(platformCountsTemp);
    setGenreCounts(genreCountsTemp);

    // Calcola i valori massimi per i range
    const { maxPriceTemp, maxHoursTemp, maxMetacriticTemp } = calculateMaxValues(games);
    setMaxPrice(maxPriceTemp);
    setMaxHours(maxHoursTemp);
    setMaxMetacritic(maxMetacriticTemp || 100); // Fallback a 100 se non ci sono giochi con Metacritic

    // Imposta i valori iniziali dei filtri di prezzo, ore e metacritic
    setFilters((prev) => ({
      ...prev,
      priceRange: [0, maxPriceTemp],
      hoursRange: [0, maxHoursTemp],
      metacriticRange: [0, maxMetacriticTemp || 100],
    }));
  }, [games]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Gestisce il toggle dei filtri di stato
  const handleStatusToggle = (status: GameStatus) => {
    setFilters((prev) => {
      const newStatus = prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status];
      return { ...prev, status: newStatus };
    });
  };

  // Gestisce il toggle dei filtri di piattaforma
  const handlePlatformToggle = (platform: string) => {
    setFilters((prev) => {
      const newPlatform = prev.platform.includes(platform)
        ? prev.platform.filter((p) => p !== platform)
        : [...prev.platform, platform];
      return { ...prev, platform: newPlatform };
    });
  };

  // Gestisce il toggle dei filtri di genere
  const handleGenreToggle = (genre: string) => {
    setFilters((prev) => {
      const newGenre = prev.genre.includes(genre)
        ? prev.genre.filter((g) => g !== genre)
        : [...prev.genre, genre];
      return { ...prev, genre: newGenre };
    });
  };

  // Gestisce il cambio del range di prezzo
  const handlePriceRangeChange = (value: number, index: number) => {
    setFilters((prev) => {
      const newPriceRange = [...prev.priceRange] as [number, number];
      newPriceRange[index] = value;
      return { ...prev, priceRange: newPriceRange };
    });
  };

  // Gestisce il cambio del range di ore
  const handleHoursRangeChange = (value: number, index: number) => {
    setFilters((prev) => {
      const newHoursRange = [...prev.hoursRange] as [number, number];
      newHoursRange[index] = value;
      return { ...prev, hoursRange: newHoursRange };
    });
  };

  // Gestisce il cambio del range di Metacritic
  const handleMetacriticRangeChange = (value: number, index: number) => {
    setFilters((prev) => {
      const newMetacriticRange = [...prev.metacriticRange] as [number, number];
      newMetacriticRange[index] = value;
      return { ...prev, metacriticRange: newMetacriticRange };
    });
  };

  // Gestisce il cambio della data di acquisto
  const handlePurchaseDateChange = (date: string) => {
    setFilters((prev) => ({ ...prev, purchaseDate: date }));
  };

  // Reimposta tutti i filtri
  const resetFilters = () => {
    setFilters({
      status: [] as GameStatus[],
      platform: [],
      genre: [],
      priceRange: [0, maxPrice],
      hoursRange: [0, maxHours],
      metacriticRange: [0, maxMetacritic],
      purchaseDate: "",
    });
  };

  // Estrai le piattaforme uniche dai dati aggiornati
  const platforms = Object.keys(platformCounts).sort();

  // Estrai i generi unici dai dati aggiornati
  const genres = Object.keys(genreCounts).sort();
  const visibleGenres = showAllGenres ? genres : genres.slice(0, 5);

  return (
    <aside
      className={`transition-all duration-300 ${
        isCollapsed ? 'w-10' : 'w-full md:w-[240px]'
      } shrink-0 bg-secondary-bg border-r border-border-color relative`}
    >
      {/* Pulsante per comprimere/espandere */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 -right-4 bg-secondary-bg border border-border-color rounded-full p-1 shadow-md hover:bg-secondary-bg/80 transition-colors"
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {!isCollapsed && (
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-montserrat font-semibold text-lg text-text-primary">Filtri</h2>
            <span className="text-sm text-text-secondary">{gamesCount} giochi</span>
          </div>

          {/* Filtri di stato */}
          <div className="mb-6">
            <button
              className="flex items-center justify-between w-full font-roboto text-sm text-text-primary mb-2"
              onClick={() => toggleSection("status")}
            >
              Stato
              {expandedSections.status ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <div className={`border-t border-border-color pt-4 ${expandedSections.status ? "block" : "hidden"}`}>
              {STATUS_OPTIONS.map((filter) => (
                <div key={filter.value} className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        id={`status-${filter.value}`}
                        checked={filters.status.includes(filter.value as GameStatus)}
                        onChange={() => handleStatusToggle(filter.value as GameStatus)}
                        className="peer h-4 w-4 appearance-none rounded border border-border-color checked:border-0 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 cursor-pointer"
                        style={{ backgroundColor: filters.status.includes(filter.value as GameStatus) ? filter.color : "transparent" }}
                      />
                      <svg
                        className="pointer-events-none absolute h-4 w-4 opacity-0 peer-checked:opacity-100"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <label
                      htmlFor={`status-${filter.value}`}
                      className="ml-2 font-roboto text-sm text-text-primary cursor-pointer"
                    >
                      {filter.label}
                    </label>
                  </div>
                  <span className="font-roboto text-xs text-text-secondary">({statusCounts[filter.value] || 0})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filtri piattaforma */}
          <div className="mb-6">
            <button
              className="flex items-center justify-between w-full font-roboto text-sm text-text-primary mb-2"
              onClick={() => toggleSection("platform")}
            >
              Piattaforma
              {expandedSections.platform ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <div className={`border-t border-border-color pt-4 ${expandedSections.platform ? "block" : "hidden"}`}>
              {platforms.map((platform) => (
                <div key={platform} className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`platform-${platform}`}
                      checked={filters.platform.includes(platform)}
                      onChange={() => handlePlatformToggle(platform)}
                      className="h-4 w-4 rounded border-border-color text-accent-primary focus:ring-accent-primary/30 cursor-pointer"
                    />
                    <label
                      htmlFor={`platform-${platform}`}
                      className="ml-2 font-roboto text-sm text-text-primary cursor-pointer"
                    >
                      {platform}
                    </label>
                  </div>
                  <span className="font-roboto text-xs text-text-secondary">({platformCounts[platform] || 0})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filtri genere */}
          <div className="mb-6">
            <button
              className="flex items-center justify-between w-full font-roboto text-sm text-text-primary mb-2"
              onClick={() => toggleSection("genre")}
            >
              Genere
              {expandedSections.genre ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <div className={`border-t border-border-color pt-4 ${expandedSections.genre ? "block" : "hidden"}`}>
              {visibleGenres.map((genre) => (
                <div key={genre} className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`genre-${genre}`}
                      checked={filters.genre.includes(genre)}
                      onChange={() => handleGenreToggle(genre)}
                      className="h-4 w-4 rounded border-border-color text-accent-primary focus:ring-accent-primary/30 cursor-pointer"
                    />
                    <label
                      htmlFor={`genre-${genre}`}
                      className="ml-2 font-roboto text-sm text-text-primary cursor-pointer"
                    >
                      {genre}
                    </label>
                  </div>
                  <span className="font-roboto text-xs text-text-secondary">({genreCounts[genre] || 0})</span>
                </div>
              ))}
              {!showAllGenres && genres.length > 5 && (
                <button
                  className="font-roboto text-sm text-accent-primary hover:text-accent-primary/80 mt-2"
                  onClick={() => setShowAllGenres(true)}
                >
                  Mostra altri ({genres.length - 5})
                </button>
              )}
              {showAllGenres && (
                <button
                  className="font-roboto text-sm text-accent-primary hover:text-accent-primary/80 mt-2"
                  onClick={() => setShowAllGenres(false)}
                >
                  Mostra meno
                </button>
              )}
            </div>
          </div>

          {/* Range slider prezzo */}
          <div className="mb-6">
            <button
              className="flex items-center justify-between w-full font-roboto text-sm text-text-primary mb-2"
              onClick={() => toggleSection("price")}
            >
              Prezzo
              {expandedSections.price ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <div className={`border-t border-border-color pt-4 ${expandedSections.price ? "block" : "hidden"}`}>
              <div className="px-1">
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceRangeChange(Number.parseInt(e.target.value), 1)}
                  className="w-full h-2 bg-quaternary rounded-lg appearance-none cursor-pointer accent-accent-primary"
                />
                <div className="flex justify-between mt-2">
                  <span className="font-roboto text-xs text-text-secondary">{filters.priceRange[0]}€</span>
                  <span className="font-roboto text-xs text-text-secondary">{filters.priceRange[1]}€</span>
                </div>
              </div>
            </div>
          </div>

          {/* Range slider ore di gioco */}
          <div className="mb-6">
            <button
              className="flex items-center justify-between w-full font-roboto text-sm text-text-primary mb-2"
              onClick={() => toggleSection("hours")}
            >
              Ore di gioco
              {expandedSections.hours ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <div className={`border-t border-border-color pt-4 ${expandedSections.hours ? "block" : "hidden"}`}>
              <div className="px-1">
                <input
                  type="range"
                  min="0" 
                  max={maxHours}
                  value={filters.hoursRange[1]}
                  onChange={(e) => handleHoursRangeChange(Number.parseInt(e.target.value), 1)}
                  className="w-full h-2 bg-quaternary rounded-lg appearance-none cursor-pointer accent-accent-primary"
                />
                <div className="flex justify-between mt-2">
                  <span className="font-roboto text-xs text-text-secondary">{filters.hoursRange[0]}h</span>
                  <span className="font-roboto text-xs text-text-secondary">{filters.hoursRange[1]}h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Range slider Metacritic */}
          <div className="mb-6">
            <button
              className="flex items-center justify-between w-full font-roboto text-sm text-text-primary mb-2"
              onClick={() => toggleSection("metacritic")}
            >
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-2 text-yellow-500" />
                Metacritic
              </div>
              {expandedSections.metacritic ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <div className={`border-t border-border-color pt-4 ${expandedSections.metacritic ? "block" : "hidden"}`}>
              <div className="px-1">
                <input
                  type="range"
                  min="0" 
                  max={maxMetacritic}
                  value={filters.metacriticRange[1]}
                  onChange={(e) => handleMetacriticRangeChange(Number.parseInt(e.target.value), 1)}
                  className="w-full h-2 bg-quaternary rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
                <div className="flex justify-between mt-2">
                  <span className="font-roboto text-xs text-text-secondary">{filters.metacriticRange[0]}</span>
                  <span className="font-roboto text-xs text-text-secondary">{filters.metacriticRange[1]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Date picker */}
          <div className="mb-6">
            <button
              className="flex items-center justify-between w-full font-roboto text-sm text-text-primary mb-2"
              onClick={() => toggleSection("date")}
            >
              Data di acquisto
              {expandedSections.date ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <div className={`border-t border-border-color pt-4 ${expandedSections.date ? "block" : "hidden"}`}>
              <div className="relative">
                <input
                  type="date"
                  value={filters.purchaseDate}
                  onChange={(e) => handlePurchaseDateChange(e.target.value)}
                  className="w-full p-2 font-roboto text-sm text-text-primary border border-border-color rounded focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Pulsanti azione */}
          <div className="flex flex-col space-y-3 mt-8">
            <button
              onClick={resetFilters}
              className="w-full py-2 px-4 bg-accent-primary text-white border border-accent-primary font-roboto font-medium text-sm rounded-lg hover:bg-accent-primary/90 hover:border-accent-primary/90 transition-colors"
            >
              Reimposta filtri
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default SidebarFilter;