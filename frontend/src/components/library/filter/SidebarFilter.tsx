import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Award, Trash2 } from 'lucide-react';
import { GameFilters, GameStatus } from '../../../types/game';
import { Status_OPTIONS } from '../../../constants/gameConstants';
import { calculateCounts, calculateMaxValues } from '../../../utils/gamesUtils';
import { useGameActions } from '../../../store/hooks/gamesHooks';
import ConfirmationModal from '../../ui/ConfirmationModal';
import { useSidebarFilterState } from '../../../hooks/useSidebarFilterState';
import { FilterAccordion } from './FilterAccordion';
import { FilterCheckboxGroup, CheckboxOption } from './FilterCheckboxGroup';
import { FilterRangeSlider } from './FilterRangeSlider';

interface SidebarFilterProps {
  filters: GameFilters;
  setFilters: React.Dispatch<React.SetStateAction<GameFilters>>;
  gamesCount: number;
  games: any[];
}

export default function SidebarFilter({ filters, setFilters, gamesCount, games }: SidebarFilterProps) {
  const {
    isCollapsed,
    setIsCollapsed,
    showAllGenres,
    setShowAllGenres,
    expandedSections,
    toggleSection
  } = useSidebarFilterState();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { removeAll } = useGameActions();

  const [StatusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [PlatformCounts, setPlatformCounts] = useState<Record<string, number>>({});
  const [genreCounts, setGenreCounts] = useState<Record<string, number>>({});

  const [maxPrice, setMaxPrice] = useState(70);
  const [maxHours, setMaxHours] = useState(100);
  const [maxMetacritic, setMaxMetacritic] = useState(100);

  useEffect(() => {
    const { StatusCountsTemp, PlatformCountsTemp, genreCountsTemp } = calculateCounts(games);
    setStatusCounts(StatusCountsTemp);
    setPlatformCounts(PlatformCountsTemp);
    setGenreCounts(genreCountsTemp);

    const { PriceRange, hoursRange, MetacriticRange } = calculateMaxValues(games);
    setMaxPrice(PriceRange[1]);
    setMaxHours(hoursRange[1]);
    setMaxMetacritic(MetacriticRange[1] || 100);

    setFilters((prev) => ({
      ...prev,
      PriceRange: [0, PriceRange[1]],
      hoursRange: [0, hoursRange[1]],
      MetacriticRange: [0, MetacriticRange[1] || 100],
    }));
  }, [games]);

  const handleStatusToggle = (Status: GameStatus) => {
    setFilters((prev) => {
      const newStatus = prev.Status.includes(Status)
        ? prev.Status.filter((s) => s !== Status)
        : [...prev.Status, Status];
      return { ...prev, Status: newStatus };
    });
  };

  const handlePlatformToggle = (Platform: string) => {
    setFilters((prev) => {
      const newPlatform = prev.Platform.includes(Platform)
        ? prev.Platform.filter((p) => p !== Platform)
        : [...prev.Platform, Platform];
      return { ...prev, Platform: newPlatform };
    });
  };

  const handleGenreToggle = (genre: string) => {
    setFilters((prev) => {
      const newGenre = prev.genre.includes(genre)
        ? prev.genre.filter((g) => g !== genre)
        : [...prev.genre, genre];
      return { ...prev, genre: newGenre };
    });
  };

  const handlePriceRangeChange = (value: number, index: number) => {
    setFilters((prev) => {
      const newPriceRange = [...prev.PriceRange] as [number, number];
      newPriceRange[index] = value;
      return { ...prev, PriceRange: newPriceRange };
    });
  };

  const handleHoursRangeChange = (value: number, index: number) => {
    setFilters((prev) => {
      const newHoursRange = [...prev.hoursRange] as [number, number];
      newHoursRange[index] = value;
      return { ...prev, hoursRange: newHoursRange };
    });
  };

  const handleMetacriticRangeChange = (value: number, index: number) => {
    setFilters((prev) => {
      const newMetacriticRange = [...prev.MetacriticRange] as [number, number];
      newMetacriticRange[index] = value;
      return { ...prev, MetacriticRange: newMetacriticRange };
    });
  };

  const handlePurchaseDateChange = (date: string) => {
    setFilters((prev) => ({ ...prev, PurchaseDate: date }));
  };

  const resetFilters = () => {
    const newFilters = {
      Status: [] as GameStatus[],
      Platform: [],
      genre: [],
      PriceRange: [0, maxPrice] as [number, number],
      hoursRange: [0, maxHours] as [number, number],
      MetacriticRange: [0, maxMetacritic] as [number, number],
      PurchaseDate: "",
    };
    setFilters(newFilters);
    localStorage.removeItem('libraryFilters');
  };

  const handleDeleteAllGames = async () => {
    try {
      await removeAll();
      setShowDeleteModal(false);
      resetFilters();
    } catch (error) {
      console.error('Errore durante l\'eliminazione dei giochi:', error);
      alert('Errore durante l\'eliminazione dei giochi');
    }
  };

  const Platforms = Object.keys(PlatformCounts).sort();
  const Genres = Object.keys(genreCounts).sort();
  const visibleGenres = showAllGenres ? Genres : Genres.slice(0, 5);

  const statusOptions: CheckboxOption[] = Status_OPTIONS.map(opt => ({
    value: opt.value,
    label: opt.label,
    count: StatusCounts[opt.value] || 0,
    color: opt.color
  }));

  const platformOptions: CheckboxOption[] = Platforms.map(p => ({
    value: p,
    label: p,
    count: PlatformCounts[p] || 0
  }));

  const genreOptions: CheckboxOption[] = visibleGenres.map(g => ({
    value: g,
    label: g,
    count: genreCounts[g] || 0
  }));

  return (
    <aside
      className={`transition-all duration-300 ${
        isCollapsed ? 'w-10' : 'w-full md:w-[240px] lg:w-[260px] max-w-[280px]'
      } shrink-0 bg-secondary-bg border-r border-border-color relative min-w-0 overflow-visible library-sidebar`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute top-4 -right-4 bg-secondary-bg border border-border-color rounded-full p-1 shadow-md hover:bg-secondary-bg/80 transition-colors z-50`}
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {!isCollapsed && (
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-montserrat font-semibold text-lg text-text-primary">Filtri</h2>
            <span className="text-sm text-text-secondary">{gamesCount} giochi</span>
          </div>

          <FilterAccordion 
            title="Stato" 
            isExpanded={expandedSections.Status} 
            onToggle={() => toggleSection("Status")}
          >
            <FilterCheckboxGroup 
              options={statusOptions} 
              selectedValues={filters.Status} 
              onToggle={(val) => handleStatusToggle(val as GameStatus)} 
              prefixId="Status" 
            />
          </FilterAccordion>

          <FilterAccordion 
            title="Piattaforma" 
            isExpanded={expandedSections.Platform} 
            onToggle={() => toggleSection("Platform")}
          >
            <FilterCheckboxGroup 
              options={platformOptions} 
              selectedValues={filters.Platform} 
              onToggle={handlePlatformToggle} 
              prefixId="Platform" 
            />
          </FilterAccordion>

          <FilterAccordion 
            title="Genere" 
            isExpanded={expandedSections.genre} 
            onToggle={() => toggleSection("genre")}
          >
            <FilterCheckboxGroup 
              options={genreOptions} 
              selectedValues={filters.genre} 
              onToggle={handleGenreToggle} 
              prefixId="genre" 
            />
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
          </FilterAccordion>

          <FilterAccordion 
            title="Prezzo" 
            isExpanded={expandedSections.Price} 
            onToggle={() => toggleSection("Price")}
          >
            <FilterRangeSlider
              min={0}
              max={maxPrice}
              currentValue={filters.PriceRange[1]}
              onChange={(val) => handlePriceRangeChange(val, 1)}
              formatValue={(val) => `${val}€`}
            />
          </FilterAccordion>

          <FilterAccordion 
            title="Ore di gioco" 
            isExpanded={expandedSections.hours} 
            onToggle={() => toggleSection("hours")}
          >
            <FilterRangeSlider
              min={0}
              max={maxHours}
              currentValue={filters.hoursRange[1]}
              onChange={(val) => handleHoursRangeChange(val, 1)}
              formatValue={(val) => `${val}h`}
            />
          </FilterAccordion>

          <FilterAccordion 
            title={
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-2 text-yellow-500" />
                Metacritic
              </div>
            } 
            isExpanded={expandedSections.Metacritic} 
            onToggle={() => toggleSection("Metacritic")}
          >
            <FilterRangeSlider
              min={0}
              max={maxMetacritic}
              currentValue={filters.MetacriticRange[1]}
              onChange={(val) => handleMetacriticRangeChange(val, 1)}
              formatValue={(val) => `${val}`}
              sliderClassName="filter-range-slider metacritic-slider"
            />
          </FilterAccordion>

          <FilterAccordion 
            title="Data di acquisto" 
            isExpanded={expandedSections.date} 
            onToggle={() => toggleSection("date")}
          >
            <div className="relative">                
              <input
                type="date"
                value={filters.PurchaseDate}
                onChange={(e) => handlePurchaseDateChange(e.target.value)}
                className="filter-date-input w-full p-2 font-roboto text-sm text-text-primary bg-primary-bg border border-border-color rounded focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/30 transition-colors"
              />
            </div>
          </FilterAccordion>

          <div className="flex flex-col space-y-3 mt-8">
            <button
              onClick={resetFilters}
              className="w-full py-2 px-4 bg-accent-primary text-white border border-accent-primary font-roboto font-medium text-sm rounded-lg hover:opacity-90 transition-opacity"
            >
              Reimposta filtri
            </button>
            
            {gamesCount > 0 && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-2 px-4 bg-accent-danger text-white border border-accent-danger font-roboto font-medium text-sm rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Elimina tutti i giochi
              </button>
            )}
          </div>
        </div>
      )}
      
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
}