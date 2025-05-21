import { Activity, ActivityType, ActivityGroup, ActivityFilters, PlayedActivityData } from '../types/activity';
import { ActivityStats, MonthlyStats } from '../types/stats';
import { extractHoursFromString, isInLastTwoWeeks } from './dateUtils';

/**
 * Verifica se un'attività è la prima di un certo tipo per un gioco in un determinato mese
 */
export function isFirstActivityInMonth(
  activity: Activity, 
  allActivities: Activity[], 
  type: ActivityType = 'played'
): boolean {
  if (activity.type !== type) return false;
  
  const activityDate = new Date(activity.timestamp);
  const activityMonth = activityDate.getMonth();
  const activityYear = activityDate.getFullYear();
  
  return !allActivities.some((a: Activity) => 
    a.id !== activity.id && 
    a.gameId === activity.gameId && 
    a.type === type && 
    new Date(a.timestamp).getMonth() === activityMonth &&
    new Date(a.timestamp).getFullYear() === activityYear &&
    new Date(a.timestamp) < activityDate
  );
}

/**
 * Ottiene dati specifici per le attività di tipo "played"
 */
export function getPlayedActivityData(
  activity: Activity, 
  allActivities: Activity[]
): PlayedActivityData | null {
  if (activity.type !== 'played' || !activity.additionalInfo) return null;
  
  const hours = extractHoursFromString(activity.additionalInfo);
  const isFirstSessionOfMonth = isFirstActivityInMonth(activity, allActivities, 'played');
  
  return {
    hours,
    isFirstSessionOfMonth
  };
}

/**
 * Calcola il tempo totale di gioco dalle attività
 */
export function calculateTotalPlaytime(activities: Activity[]): number {
  return activities
    .filter(a => a.type === 'played' && a.additionalInfo)
    .reduce((total, activity) => {
      return total + extractHoursFromString(activity.additionalInfo);
    }, 0);
}

/**
 * Calcola il tempo di gioco nelle ultime due settimane
 */
export function calculateRecentPlaytime(activities: Activity[]): number {
  return activities
    .filter(a => a.type === 'played' && a.additionalInfo && isInLastTwoWeeks(new Date(a.timestamp)))
    .reduce((total, activity) => {
      return total + extractHoursFromString(activity.additionalInfo);
    }, 0);
}

/**
 * Calcola varie statistiche dalle attività
 */
export function calculateActivityStats(activities: Activity[]): ActivityStats {
  // Calcola la data dell'ultima attività
  const lastUpdate = activities.length > 0 
    ? new Date(
        activities.reduce((maxDate, activity) => {
          const activityDate = new Date(activity.timestamp).getTime();
          return activityDate > maxDate ? activityDate : maxDate;
        }, 0)
      )
    : null;
    
  // Calcola le statistiche
  return {
    totalEntries: activities.length,
    totalSessions: activities.filter(a => a.type === 'played').length,
    totalCompletions: activities.filter(a => a.type === 'completed').length,
    totalPlatinums: activities.filter(a => a.type === 'platinum').length,
    totalPlaytime: calculateTotalPlaytime(activities),
    recentPlaytime: calculateRecentPlaytime(activities),
    lastUpdate
  };
}

/**
 * Calcola le statistiche mensili per un gruppo di attività
 */
export function calculateMonthlyStats(activities: Activity[]): MonthlyStats {
  const played = activities.filter(a => a.type === 'played').length;
  const completed = activities.filter(a => a.type === 'completed').length;
  const rated = activities.filter(a => a.type === 'rated').length;
  const hours = calculateTotalPlaytime(activities);
  
  return {
    total: activities.length,
    played,
    completed,
    rated,
    hours
  };
}

/**
 * Ordina le attività per data (più recenti prima)
 */
export function sortActivitiesByDate(activities: Activity[]): Activity[] {
  return [...activities].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Raggruppa le attività per mese e anno
 */
export function groupActivitiesByMonth(activities: Activity[]): ActivityGroup[] {
  const groupedMap: Record<string, Activity[]> = {};
  
  // Raggruppa le attività per chiave anno-mese
  activities.forEach(activity => {
    const date = new Date(activity.timestamp);
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = `${year}-${month}`;
    
    if (!groupedMap[key]) {
      groupedMap[key] = [];
    }
    
    groupedMap[key].push(activity);
  });
  
  // Converte la mappa in un array di ActivityGroup
  return Object.entries(groupedMap).map(([key, activities]) => {
    const [yearStr, monthStr] = key.split('-');
    return {
      year: parseInt(yearStr),
      month: parseInt(monthStr),
      activities: sortActivitiesByDate(activities)
    };
  }).sort((a, b) => {
    // Ordina per anno e mese decrescente (prima i più recenti)
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
}

/**
 * Filtra le attività in base ai criteri specificati
 */
export function filterActivities(
  activities: Activity[], 
  filters: ActivityFilters
): Activity[] {
  let filtered = [...activities];
  
  // Filtra per tipo di attività
  if (filters.types && filters.types.length > 0) {
    filtered = filtered.filter(a => filters.types!.includes(a.type));
  }
  
  // Filtra per anno
  if (filters.year !== undefined) {
    filtered = filtered.filter(a => 
      new Date(a.timestamp).getFullYear() === filters.year
    );
  }
  
  // Filtra per mese
  if (filters.month !== undefined) {
    filtered = filtered.filter(a => 
      new Date(a.timestamp).getMonth() === filters.month
    );
  }
  
  // Filtra per gioco
  if (filters.gameId !== undefined) {
    filtered = filtered.filter(a => a.gameId === filters.gameId);
  }
  
  // Applica ordinamento
  filtered = filters.sortDirection === 'asc'
    ? filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : sortActivitiesByDate(filtered);
  
  // Limita il numero di risultati
  if (filters.limit !== undefined) {
    filtered = filtered.slice(0, filters.limit);
  }
  
  return filtered;
}

/**
 * Filtra le attività per anno
 */
export function filterActivitiesByYear(activities: Activity[], year: number): Activity[] {
  return activities.filter(activity => {
    const activityDate = new Date(activity.timestamp);
    return activityDate.getFullYear() === year;
  });
}

/**
 * Ottiene i mesi unici per un anno specifico, ordinati dal più recente
 */
export function getUniqueMonthsForYear(activities: Activity[], year: number): number[] {
  const yearActivities = filterActivitiesByYear(activities, year);
  const uniqueMonths = new Set<number>();
  
  yearActivities.forEach(activity => {
    const month = new Date(activity.timestamp).getMonth();
    uniqueMonths.add(month);
  });
  
  return Array.from(uniqueMonths).sort((a, b) => b - a); // Ordina in modo decrescente
}