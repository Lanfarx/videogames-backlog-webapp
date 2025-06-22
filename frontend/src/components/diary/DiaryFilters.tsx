import React from 'react';
import { Calendar, Filter, Check } from 'lucide-react';

interface DiaryFiltersProps {
  year: number;
  onYearChange: (year: number) => void;
  month?: number;
  onMonthChange?: (month: number | undefined) => void;
  activeFilters: string[];
  onFilterChange: (filter: string) => void;
}

const DiaryFilters: React.FC<DiaryFiltersProps> = ({
  year,
  onYearChange,
  month,
  onMonthChange,
  activeFilters,
  onFilterChange
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];
  
  const filters = [
    { id: 'all', label: 'Tutto' },
    { id: 'Played', label: 'Giocati' },
    { id: 'Completed', label: 'Completati' },
    { id: 'Abandoned', label: 'Abbandonati' },
    { id: 'Rated', label: 'Recensiti' },
    { id: 'Platinum', label: 'Platinati' }
  ];
  
  return (
    <div className="bg-secondary-bg p-4 rounded-lg mb-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-accent-primary" />
          <div className="relative">
            <select
              value={year}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="pl-2 pr-8 py-1 bg-primary-bg border border-border-color rounded-md text-text-primary appearance-none cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>          {onMonthChange && (
            <div className="relative ml-2">
              <select
                value={month ?? ''}
                onChange={e => {
                  const value = e.target.value;
                  onMonthChange(value === '' ? undefined : Number(value));
                }}
                className="pl-2 pr-8 py-1 bg-primary-bg border border-border-color rounded-md text-text-primary appearance-none cursor-pointer"
              >
                <option value="">Tutti i mesi</option>
                {months.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center mr-2">
            <Filter className="w-4 h-4 text-text-secondary mr-1" />
            <span className="text-sm text-text-secondary">Filtri:</span>
          </div>
          
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`px-3 py-1 text-sm rounded-full flex items-center ${
                activeFilters.includes(filter.id)
                  ? 'bg-accent-primary text-white'
                  : 'bg-primary-bg text-text-primary border border-border-color hover:bg-tertiary-bg'
              }`}
            >
              {activeFilters.includes(filter.id) && (
                <Check className="w-3 h-3 mr-1" />
              )}
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiaryFilters;