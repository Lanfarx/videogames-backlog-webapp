import { useRef, useEffect, useState } from 'react';
import { X, Filter, Calendar } from 'lucide-react';
import { Activity, ActivitySource, ActivityType } from '../../../types/activity';
import { getActivityColor } from '../../../constants/gameConstants';
import { getActivities } from '../../../store/services/activityService';
import ActivityHistoryRow from './ActivityHistoryRow';
import { groupActivitiesByDay } from '../../../utils/activityUtils';
import { PaginationControls } from '../PaginationControls';

interface ActivitiesHistoryPopoverProps {
  onClose: () => void;
  gameId?: number;
  gameTitle?: string;
}

const ActivitiesHistoryPopover = ({ onClose, gameId, gameTitle }: ActivitiesHistoryPopoverProps) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>();
  const [selectedSource, setSelectedSource] = useState<ActivitySource | undefined>();
  
  const pageSize = 20;

  const loadActivities = async () => {
    setLoading(true);
    try {
      const filters = {
        GameId: gameId,
        Types: selectedTypes.length > 0 ? selectedTypes : undefined,
        Year: selectedYear,
        Month: selectedMonth,
        Source: selectedSource,
        SortDirection: 'desc' as const
      };
      
      const result = await getActivities(filters, currentPage, pageSize);
      setActivities(result.activities);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error('Errore nel caricamento delle attività:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [gameId, currentPage, selectedTypes, selectedYear, selectedMonth, selectedSource]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const toggleActivityType = (type: ActivityType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
    setCurrentPage(1);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year === '' ? undefined : parseInt(year));
    setCurrentPage(1);
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month === '' ? undefined : parseInt(month));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedYear(undefined);
    setSelectedMonth(undefined);
    setSelectedSource(undefined);
    setCurrentPage(1);
  };

  const hasFilters = selectedTypes.length > 0 || !!selectedYear || !!selectedMonth || !!selectedSource;

  const activityTypes: ActivityType[] = ['Added', 'Played', 'Completed', 'Platinum', 'Abandoned'];
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    { value: 1, label: 'Gennaio' }, { value: 2, label: 'Febbraio' }, { value: 3, label: 'Marzo' },
    { value: 4, label: 'Aprile' }, { value: 5, label: 'Maggio' }, { value: 6, label: 'Giugno' },
    { value: 7, label: 'Luglio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Settembre' },
    { value: 10, label: 'Ottobre' }, { value: 11, label: 'Novembre' }, { value: 12, label: 'Dicembre' }
  ];
  
  const days = groupActivitiesByDay(
    [...activities].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  );

  const title = gameTitle ? `Cronologia completa: ${gameTitle}` : `Cronologia completa attività`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 game-timeline-popover">
      <div 
        ref={popoverRef}
        className="bg-primary-bg border border-border-color rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-lg dropdown-dark-shadow flex flex-col"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-primary font-semibold text-xl text-text-primary">
            {title}
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                showFilters || hasFilters
                  ? 'bg-accent-primary text-white' 
                  : 'text-text-secondary hover:text-accent-primary'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span className="text-sm">Filtri</span>
            </button>
            <button 
              onClick={onClose}
              className="text-text-secondary hover:text-accent-primary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-secondary-bg border border-border-color rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Tipo di attività</label>
                <div className="space-y-2">
                  {activityTypes.map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() => toggleActivityType(type)}
                        className="mr-2 accent-accent-primary"
                      />
                      <span className="flex items-center gap-2 text-sm text-text-secondary">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getActivityColor(type) }}></div>
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Anno</label>
                <select
                  value={selectedYear || ''}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="w-full p-2 border border-border-color rounded-lg bg-primary-bg text-text-primary"
                >
                  <option value="">Tutti gli anni</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Mese</label>
                <select
                  value={selectedMonth || ''}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="w-full p-2 border border-border-color rounded-lg bg-primary-bg text-text-primary"
                >
                  <option value="">Tutti i mesi</option>
                  {months.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Origine</label>
                <select
                  value={selectedSource || ''}
                  onChange={(e) => { setSelectedSource((e.target.value || undefined) as ActivitySource | undefined); setCurrentPage(1); }}
                  className="w-full p-2 border border-border-color rounded-lg bg-primary-bg text-text-primary"
                >
                  <option value="">Tutte</option>
                  <option value="Steam">Da Steam</option>
                  <option value="Manual">Manuali</option>
                </select>
              </div>
            </div>

            {hasFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-text-secondary hover:text-accent-primary transition-colors"
                >
                  Pulisci filtri
                </button>
              </div>
            )}
          </div>
        )}

        <div className="text-sm text-text-secondary mb-4">
          {loading ? (
            'Caricamento...'
          ) : (
            `${totalCount} attività trovate${totalPages > 1 ? ` - Pagina ${currentPage} di ${totalPages}` : ''}`
          )}
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-text-secondary">Caricamento attività...</div>
            </div>
          ) : days.length > 0 ? (
            <div className="space-y-4">
              {days.map(group => (
                <section key={group.day}>
                  <h4 className="sticky top-0 bg-primary-bg py-1 text-xs font-semibold text-text-secondary capitalize flex items-center gap-2 border-b border-border-color">
                    <Calendar className="h-3 w-3" />
                    {group.label}
                  </h4>
                  {group.activities.map(activity => (
                    <ActivityHistoryRow key={activity.id} activity={activity} onChanged={loadActivities} />
                  ))}
                </section>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-text-secondary font-secondary text-sm">
                {hasFilters
                  ? 'Nessuna attività trovata con i filtri selezionati.'
                  : gameId ? 'Nessuna attività registrata per questo gioco.' : 'Nessuna attività registrata.'}
              </p>
            </div>
          )}
        </div>

        <PaginationControls 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          loading={loading}
          variant="numbers"
        />
      </div>
    </div>
  );
};

export default ActivitiesHistoryPopover;
