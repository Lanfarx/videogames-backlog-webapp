import { useState, useEffect } from 'react';
import { CalendarRange, Pencil, Clock } from 'lucide-react';
import DiaryFilters from '../../components/diary/DiaryFilters';
import DiaryMonthGroup from '../../components/diary/DiaryMonthGroup';
import { Activity } from '../../types/activity';
import { useAllActivities } from '../../store/hooks/activitiesHooks';
import { formatLastUpdate } from '../../utils/dateUtils';
import { 
  calculateActivityStats, 
  getUniqueMonthsForYear,
  filterActivitiesByYear
} from '../../utils/activityUtils';

const DiarioPage = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
  const [activeFilters, setActiveFilters] = useState<string[]>(['all']);
  const [activities, setActivities] = useState<Activity[]>([]);
  
  const { activities: allActivities, loading } = useAllActivities();

  useEffect(() => {
    setActivities(allActivities);
  }, [allActivities]);

  // Calcola statistiche generali utilizzando le funzioni di utilità
  const stats = calculateActivityStats(activities);

  const handleFilterChange = (filter: string) => {
    if (filter === 'all') {
      setActiveFilters(['all']);
    } else {
      const newFilters = activeFilters.filter(f => f !== 'all');
      if (newFilters.includes(filter)) {
        // Rimuovi il filtro se già presente
        const updatedFilters = newFilters.filter(f => f !== filter);
        // Se rimosso l'ultimo filtro, imposta su "all"
        setActiveFilters(updatedFilters.length === 0 ? ['all'] : updatedFilters);
      } else {
        // Aggiungi il filtro
        setActiveFilters([...newFilters, filter]);
      }
    }
  };

  // Filtra le attività per anno e mese selezionati
  const filteredActivities = activities.filter(a => {
    const d = new Date(a.Timestamp);
    const yearMatch = d.getFullYear() === selectedYear;
    const monthMatch = selectedMonth === undefined ? true : d.getMonth() === selectedMonth;
    return yearMatch && monthMatch;
  });

  // Ottieni mesi unici per l'anno selezionato (per la select)
  const months = getUniqueMonthsForYear(activities, selectedYear);

  return (
      <div className="container mx-auto px-4 sm:px-8 py-8 sm:py-14">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary font-primary">
            Diario di Gioco
          </h1>
          <div className="text-sm text-accent-primary">
            Tutte le attività vengono registrate automaticamente dalla libreria
          </div>
        </div>
        
        <p className="text-base text-text-secondary font-secondary mb-8">
          Il tuo diario personale di esperienze videoludiche. Visualizza, filtra e organizza le tue attività di gioco per data.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-secondary-bg p-6 rounded-lg shadow-sm flex items-center">
            <CalendarRange className="w-10 h-10 text-accent-primary mr-4" />
            <div>
              <p className="text-sm text-text-secondary">Voci totali</p>
              <p className="text-2xl font-bold text-text-primary">{stats.totalEntries}</p>
            </div>
          </div>
          
          <div className="bg-secondary-bg p-6 rounded-lg shadow-sm flex items-center">
            <Clock className="w-10 h-10 text-accent-primary mr-4" />
            <div>
              <p className="text-sm text-text-secondary">Tempo di gioco (ultime 2 settimane)</p>
              <p className="text-2xl font-bold text-text-primary">
                {stats.recentPlaytime}h
              </p>
            </div>
          </div>
          
          <div className="bg-secondary-bg p-6 rounded-lg shadow-sm flex items-center">
            <Pencil className="w-10 h-10 text-accent-primary mr-4" />
            <div>
              <p className="text-sm text-text-secondary">Ultimo aggiornamento</p>
              <p className="text-2xl font-bold text-text-primary">{formatLastUpdate(stats.lastUpdate)}</p>
            </div>
          </div>
        </div>
        
        {/* Filtri */}
        <DiaryFilters 
          year={selectedYear}
          onYearChange={setSelectedYear}
          month={selectedMonth}
          onMonthChange={setSelectedMonth}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
        />
        
        {/* Contenuto del diario */}
        <div className="bg-primary-bg rounded-lg shadow-sm p-6">
          {filteredActivities.length > 0 ? (
            <div className="space-y-8">
              {/* Raggruppa per mese solo se non è selezionato un mese specifico */}
              {selectedMonth === undefined ? (
                months.map(month => (
                  <DiaryMonthGroup 
                    key={`${selectedYear}-${month}`}
                    month={month}
                    year={selectedYear}
                    activities={filteredActivities}
                    activeFilters={activeFilters}
                  />
                ))
              ) : (
                <DiaryMonthGroup 
                  key={`${selectedYear}-${selectedMonth}`}
                  month={selectedMonth}
                  year={selectedYear}
                  activities={filteredActivities}
                  activeFilters={activeFilters}
                />
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-bold text-text-primary font-primary mb-4">
                Nessuna attività per questo periodo
              </h2>
              <p className="text-text-secondary font-secondary max-w-2xl mx-auto mb-6">
                Non hai registrato attività di gioco per l'anno {selectedYear}{selectedMonth !== undefined ? ` e mese ${selectedMonth + 1}` : ''}. 
                Le attività di gioco vengono aggiunte automaticamente quando registri progressi nella sezione Libreria.
              </p>
            </div>
          )}
        </div>
      </div>
  );
};

export default DiarioPage;