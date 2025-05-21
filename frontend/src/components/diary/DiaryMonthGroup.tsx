import React from 'react';
import { Activity } from '../../types/activity';
import DiaryEntry from './DiaryEntry';

interface DiaryMonthGroupProps {
  month: number;
  year: number;
  activities: Activity[];
  activeFilters: string[];
}

const DiaryMonthGroup: React.FC<DiaryMonthGroupProps> = ({
  month,
  year,
  activities,
  activeFilters
}) => {
  // Filtra le attività per il mese e l'anno corrente
  const monthActivities = activities.filter(activity => {
    const activityDate = new Date(activity.timestamp);
    return activityDate.getMonth() === month && activityDate.getFullYear() === year;
  });

  // Filtra ulteriormente in base ai filtri attivi
  const filteredActivities = activeFilters.includes('all')
    ? monthActivities
    : monthActivities.filter(activity => activeFilters.includes(activity.type));

  // Se non ci sono attività dopo il filtraggio, non mostrare il gruppo
  if (filteredActivities.length === 0) {
    return null;
  }

  // Ordina le attività per data (più recenti prima)
  const sortedActivities = [...filteredActivities].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Formatta il nome del mese in italiano
  const monthName = new Date(year, month).toLocaleString('it-IT', { month: 'long' });
  
  // Calcola le statistiche del mese
  const stats = {
    total: sortedActivities.length,
    completed: sortedActivities.filter(a => a.type === 'completed').length,
    played: sortedActivities.filter(a => a.type === 'played').length,
    rated: sortedActivities.filter(a => a.type === 'rated').length,
    hours: sortedActivities
      .filter(a => a.type === 'played' && a.additionalInfo)
      .reduce((total, activity) => {
        const hoursMatch = activity.additionalInfo?.match(/(\d+)\s*ore/);
        return total + (hoursMatch ? parseInt(hoursMatch[1], 10) : 0);
      }, 0)
  };

  return (
    <div className="mb-10">
      <div className="border-b-2 border-accent-primary pb-2 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-text-primary capitalize">
            {monthName} {year}
          </h2>
          <div className="text-sm text-text-secondary">
            <span className="mr-4">{stats.total} attività</span>
            {stats.hours > 0 && <span>{stats.hours} ore giocate</span>}
          </div>
        </div>
      </div>
      
      <div className="space-y-1">
        {sortedActivities.map(activity => (
          <DiaryEntry 
            key={activity.id} 
            activity={activity} 
            allActivities={activities}
          />
        ))}
      </div>
    </div>
  );
};

export default DiaryMonthGroup;