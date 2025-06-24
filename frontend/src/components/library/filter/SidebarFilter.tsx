import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Calendar, Award, Trash2 } from 'lucide-react';
import { GameFilters, GameStatus } from '../../../types/game';
import { Status_OPTIONS } from '../../../constants/gameConstants';
import { calculateCounts, calculateMaxValues } from '../../../utils/gamesUtils';
import { useGameActions } from '../../../store/hooks/gamesHooks';
import ConfirmationModal from '../../ui/ConfirmationModal';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    Status: true,
    Platform: true,
    genre: true,
    Price: true,
    hours: true,
    Metacritic: true,
    date: true,  });
  // Hook per azioni sui giochi
  const { removeAll } = useGameActions();

  // Calcola i conteggi per ogni filtro
  const [StatusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [PlatformCounts, setPlatformCounts] = useState<Record<string, number>>({});
  const [genreCounts, setGenreCounts] = useState<Record<string, number>>({});

  // Calcola i valori massimi per i range
  const [maxPrice, setMaxPrice] = useState(70);
  const [maxHours, setMaxHours] = useState(100);
  const [maxMetacritic, setMaxMetacritic] = useState(100);

  useEffect(() => {
    // Calcola i conteggi reali dai dati di games
    const { StatusCountsTemp, PlatformCountsTemp, genreCountsTemp } = calculateCounts(games);
    setStatusCounts(StatusCountsTemp);
    setPlatformCounts(PlatformCountsTemp);
    setGenreCounts(genreCountsTemp);

    // Calcola i valori massimi per i range
    const { PriceRange, hoursRange, MetacriticRange } = calculateMaxValues(games);
    setMaxPrice(PriceRange[1]);
    setMaxHours(hoursRange[1]);
    setMaxMetacritic(MetacriticRange[1] || 100); // Fallback a 100 se non ci sono giochi con Metacritic

    // Imposta i valori iniziali dei filtri di prezzo, ore e Metacritic
    setFilters((prev) => ({
      ...prev,
      PriceRange: [0, PriceRange[1]],
      hoursRange: [0, hoursRange[1]],
      MetacriticRange: [0, MetacriticRange[1] || 100],
    }));
  }, [games]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Gestisce il toggle dei filtri di stato
  const handleStatusToggle = (Status: GameStatus) => {
    setFilters((prev) => {
      const newStatus = prev.Status.includes(Status)
        ? prev.Status.filter((s) => s !== Status)
        : [...prev.Status, Status];
      return { ...prev, Status: newStatus };
    });
  };

  // Gestisce il toggle dei filtri di piattaforma
  const handlePlatformToggle = (Platform: string) => {
    setFilters((prev) => {
      const newPlatform = prev.Platform.includes(Platform)
        ? prev.Platform.filter((p) => p !== Platform)
        : [...prev.Platform, Platform];
      return { ...prev, Platform: newPlatform };
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
  };  // Gestisce il cambio del range di prezzo
  const handlePriceRangeChange = (value: number, index: number) => {
    setFilters((prev) => {
      const newPriceRange = [...prev.PriceRange] as [number, number];
      newPriceRange[index] = value;
      return { ...prev, PriceRange: newPriceRange };
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
      const newMetacriticRange = [...prev.MetacriticRange] as [number, number];
      newMetacriticRange[index] = value;
      return { ...prev, MetacriticRange: newMetacriticRange };
    });
  };

  // Gestisce il cambio della data di acquisto
  const handlePurchaseDateChange = (date: string) => {
    setFilters((prev) => ({ ...prev, PurchaseDate: date }));
  };
  // Reimposta tutti i filtri
  const resetFilters = () => {
    setFilters({
      Status: [] as GameStatus[],
      Platform: [],
      genre: [],
      PriceRange: [0, maxPrice],
      hoursRange: [0, maxHours],
      MetacriticRange: [0, maxMetacritic],
      PurchaseDate: "",
    });
  };
  // Funzione per eliminare tutti i giochi
  const handleDeleteAllGames = async () => {
    try {
      // Usa l'endpoint ottimizzato per eliminare tutti i giochi in una sola chiamata
      await removeAll();
      // Chiudi il modal e reimposta i filtri
      setShowDeleteModal(false);
      resetFilters();
    } catch (error) {
      console.error('Errore durante l\'eliminazione dei giochi:', error);
      alert('Errore durante l\'eliminazione dei giochi');
    }
  };

  // Estrai le piattaforme uniche dai dati aggiornati
  const Platforms = Object.keys(PlatformCounts).sort();

  // Estrai i generi unici dai dati aggiornati
  const Genres = Object.keys(genreCounts).sort();
  const visibleGenres = showAllGenres ? Genres : Genres.slice(0, 5);

  return (    <aside
      className={`transition-all duration-300 ${
        isCollapsed ? 'w-10' : 'w-full md:w-[240px] lg:w-[260px] max-w-[280px]'
      } shrink-0 bg-secondary-bg border-r border-border-color relative min-w-0 overflow-hidden library-sidebar`}
    >
      {/* Pulsante per comprimere/espandere */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute top-4 -right-4 bg-secondary-bg border border-border-color rounded-full p-1 shadow-md hover:bg-secondary-bg/80 transition-colors z-10`}
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
              onClick={() => toggleSection("Status")}
            >
              Stato
              {expandedSections.Status ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <div className={`border-t border-border-color pt-4 ${expandedSections.Status ? "block" : "hidden"}`}>
              {Status_OPTIONS.map((filter) => (
                <div key={filter.value} className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        id={`Status-${filter.value}`}
                        checked={filters.Status.includes(filter.value as GameStatus)}
                        onChange={() => handleStatusToggle(filter.value as GameStatus)}
                        className="peer h-4 w-4 appearance-none rounded border border-border-color checked:border-0 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 cursor-pointer"
                        style={{ backgroundColor: filters.Status.includes(filter.value as GameStatus) ? filter.color : "transparent" }}
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
                      htmlFor={`Status-${filter.value}`}
                      className="ml-2 font-roboto text-sm text-text-primary cursor-pointer"
                    >
                      {filter.label}
                    </label>
                  </div>
                  <span className="font-roboto text-xs text-text-secondary">({StatusCounts[filter.value] || 0})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filtri piattaforma */}
          <div className="mb-6">
            <button
              className="flex items-center justify-between w-full font-roboto text-sm text-text-primary mb-2"
              onClick={() => toggleSection("Platform")}
            >
              Piattaforma
              {expandedSections.Platform ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <div className={`border-t border-border-color pt-4 ${expandedSections.Platform ? "block" : "hidden"}`}>
              {Platforms.map((Platform) => (
                <div key={Platform} className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`Platform-${Platform}`}
                      checked={filters.Platform.includes(Platform)}
                      onChange={() => handlePlatformToggle(Platform)}
                      className="h-4 w-4 rounded border-border-color text-accent-primary focus:ring-accent-primary/30 cursor-pointer"
                    />
                    <label
                      htmlFor={`Platform-${Platform}`}
                      className="ml-2 font-roboto text-sm text-text-primary cursor-pointer"
                    >
                      {Platform}
                    </label>
                  </div>
                  <span className="font-roboto text-xs text-text-secondary">({PlatformCounts[Platform] || 0})</span>
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
              {!showAllGenres && Genres.length > 5 && (
                <button
                  className="font-roboto text-sm text-accent-primary hover:text-accent-primary/80 mt-2"
                  onClick={() => setShowAllGenres(true)}
                >
                  Mostra altri ({Genres.length - 5})
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
              onClick={() => toggleSection("Price")}
            >
              Prezzo
              {expandedSections.Price ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <div className={`border-t border-border-color pt-4 ${expandedSections.Price ? "block" : "hidden"}`}>
              <div className="px-1">                  <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={filters.PriceRange[1]}
                  onChange={(e) => handlePriceRangeChange(Number.parseInt(e.target.value), 1)}
                  className="filter-range-slider w-full h-2"
                />
                <div className="flex justify-between mt-2">
                  <span className="font-roboto text-xs text-text-secondary">{filters.PriceRange[0]}€</span>
                  <span className="font-roboto text-xs text-text-secondary">{filters.PriceRange[1]}€</span>
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
              <div className="px-1">                  <input
                  type="range"
                  min="0" 
                  max={maxHours}
                  value={filters.hoursRange[1]}
                  onChange={(e) => handleHoursRangeChange(Number.parseInt(e.target.value), 1)}
                  className="filter-range-slider w-full h-2"
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
              onClick={() => toggleSection("Metacritic")}
            >
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-2 text-yellow-500" />
                Metacritic
              </div>
              {expandedSections.Metacritic ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <div className={`border-t border-border-color pt-4 ${expandedSections.Metacritic ? "block" : "hidden"}`}>
              <div className="px-1">                <input
                  type="range"
                  min="0" 
                  max={maxMetacritic}
                  value={filters.MetacriticRange[1]}
                  onChange={(e) => handleMetacriticRangeChange(Number.parseInt(e.target.value), 1)}
                  className="filter-range-slider metacritic-slider w-full h-2"
                />
                <div className="flex justify-between mt-2">
                  <span className="font-roboto text-xs text-text-secondary">{filters.MetacriticRange[0]}</span>
                  <span className="font-roboto text-xs text-text-secondary">{filters.MetacriticRange[1]}</span>
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
                  value={filters.PurchaseDate}
                  onChange={(e) => handlePurchaseDateChange(e.target.value)}
                  className="filter-date-input w-full p-2 font-roboto text-sm text-text-primary bg-primary-bg border border-border-color rounded focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/30 transition-colors"
                />
              </div>
            </div>
          </div>          {/* Pulsanti azione */}
          <div className="flex flex-col space-y-3 mt-8">
            <button
              onClick={resetFilters}
              className="w-full py-2 px-4 bg-accent-primary text-white border border-accent-primary font-roboto font-medium text-sm rounded-lg hover:bg-accent-primary/90 hover:border-accent-primary/90 transition-colors"
            >
              Reimposta filtri
            </button>
            
            {/* Bottone per eliminare tutti i giochi */}
            {gamesCount > 0 && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-2 px-4 bg-accent-danger text-white border border-accent-danger font-roboto font-medium text-sm rounded-lg hover:bg-accent-danger/90 hover:border-accent-danger/90 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Elimina tutti i giochi
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Modal di conferma per eliminazione di tutti i giochi */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAllGames}
        title="Eliminare tutti i giochi?"
        message={`Sei sicuro di voler eliminare tutti i ${gamesCount} giochi dalla libreria? Questa azione non può essere annullata.`}
        confirmButtontext="Elimina tutto"
        cancelButtontext="Annulla"
        type="danger"
      />
    </aside>
  );
};

export default SidebarFilter;