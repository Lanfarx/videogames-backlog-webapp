import { useRef, useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Filter, Calendar } from 'lucide-react';
import { Activity, ActivityType } from '../../../types/activity';
import { getActivityColor } from '../../../constants/gameConstants';
import { getActivities } from '../../../store/services/activityService';
import ActivityTimelineItem from './ActivityTimelineItem';

interface ActivityHistoryPopoverProps {
  gameId: number;
  onClose: () => void;
  GameTitle: string;
}

const ActivityHistoryPopover = ({ gameId, onClose, GameTitle }: ActivityHistoryPopoverProps) => {
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
  
  const pageSize = 20;
  // Funzione per caricare le attività
  const loadActivities = async () => {
    setLoading(true);
    try {
      const filters = {
        GameId: gameId,
        Types: selectedTypes.length > 0 ? selectedTypes : undefined,
        Year: selectedYear,
        Month: selectedMonth,
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

  // Carica le attività quando cambiano i filtri o la pagina
  useEffect(() => {
    loadActivities();
  }, [gameId, currentPage, selectedTypes, selectedYear, selectedMonth]);

  // Chiudi il popover quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Funzioni per i filtri
  const toggleActivityType = (type: ActivityType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
    setCurrentPage(1); // Reset alla prima pagina quando si cambia filtro
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
    setCurrentPage(1);
  };

  const activityTypes: ActivityType[] = ['Added', 'Played', 'Completed', 'Platinum', 'Abandoned'];
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    { value: 1, label: 'Gennaio' },
    { value: 2, label: 'Febbraio' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Aprile' },
    { value: 5, label: 'Maggio' },
    { value: 6, label: 'Giugno' },
    { value: 7, label: 'Luglio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Settembre' },
    { value: 10, label: 'Ottobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Dicembre' }
  ];
    // Ordina le attività per data (dalla più recente alla più vecchia)
  const sortedActivities = [...activities].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div 
        ref={popoverRef}
        className="bg-primary-bg border border-border-color rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-lg flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-primary font-semibold text-xl text-text-primary">
            Cronologia completa: {GameTitle}
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                showFilters || selectedTypes.length > 0 || selectedYear || selectedMonth
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

        {/* Filtri */}
        {showFilters && (
          <div className="bg-secondary-bg border border-border-color rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro per tipo di attività */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Tipo di attività
                </label>
                <div className="space-y-2">
                  {activityTypes.map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() => toggleActivityType(type)}
                        className="mr-2 accent-accent-primary"
                      />
                      <span 
                        className="flex items-center gap-2 text-sm text-text-secondary"
                      >
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getActivityColor(type) }}
                        ></div>
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filtro per anno */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Anno
                </label>
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

              {/* Filtro per mese */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Mese
                </label>
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
            </div>

            {/* Pulsante per pulire i filtri */}
            {(selectedTypes.length > 0 || selectedYear || selectedMonth) && (
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

        {/* Info risultati */}
        <div className="text-sm text-text-secondary mb-4">
          {loading ? (
            'Caricamento...'
          ) : (
            `${totalCount} attività trovate${totalPages > 1 ? ` - Pagina ${currentPage} di ${totalPages}` : ''}`
          )}
        </div>

        {/* Lista attività */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-text-secondary">Caricamento attività...</div>
            </div>
          ) : sortedActivities.length > 0 ? (
            <div className="space-y-4">
              {sortedActivities.map((activity, i) => {
                const prevActivity = i > 0 ? sortedActivities[i-1] : undefined;
                const isLastActivity = i === sortedActivities.length - 1;
                
                // Mostra la data solo se è diversa dalla precedente
                const showDate =
                  i === 0 || new Date(activity.timestamp).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' }) !==
                    new Date(sortedActivities[i - 1].timestamp).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' });
                
                return (
                  <div key={activity.id} className="pb-4 border-b border-border-color last:border-0 flex items-center">
                    {/* Timeline dot con colore dinamico */}
                    <div 
                      className="w-3 h-3 rounded-full mr-3 shrink-0"
                      style={{ backgroundColor: getActivityColor(activity.type) }}
                    ></div>
                    <div className="flex-1">
                      {showDate && (
                        <div className="text-xs text-text-secondary font-secondary mb-1 flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(activity.timestamp).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          <span>{new Date(activity.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}
                      <ActivityTimelineItem 
                        activity={activity}
                        previousActivity={prevActivity}
                        isLastActivity={isLastActivity}
                        showDate={false}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-text-secondary font-secondary text-sm">
                {(selectedTypes.length > 0 || selectedYear || selectedMonth) 
                  ? 'Nessuna attività trovata con i filtri selezionati.'
                  : 'Nessuna attività registrata per questo gioco.'}
              </p>
            </div>
          )}
        </div>

        {/* Paginazione */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-color">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
              className="flex items-center gap-2 px-4 py-2 text-sm disabled:text-text-secondary disabled:cursor-not-allowed text-text-primary hover:text-accent-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Precedente
            </button>            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={loading}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      currentPage === pageNum
                        ? 'bg-accent-primary text-white'
                        : 'text-text-secondary hover:text-accent-primary'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || loading}
              className="flex items-center gap-2 px-4 py-2 text-sm disabled:text-text-secondary disabled:cursor-not-allowed text-text-primary hover:text-accent-primary transition-colors"
            >
              Successiva
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityHistoryPopover;
