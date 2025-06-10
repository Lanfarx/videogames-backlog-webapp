import { Activity, ActivityType, ActivityGroup, ActivityFilters } from '../types/activity';
import { ActivityStats, MonthlyStats } from '../types/stats';
import { extractHoursFromString, isInLastTwoWeeks } from './dateUtils';
import { getActivityColor } from '../constants/gameConstants';
import { Trophy, Clock, Gamepad2, Star, Award, X } from 'lucide-react';
import React from 'react';

/**
 * Verifica se un'attività è la prima di un certo tipo per un gioco in un determinato mese
 */
export function isFirstActivityInMonth(
  activity: Activity, 
  allActivities: Activity[], 
  type: ActivityType = 'Played'
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
 * Calcola il tempo totale di gioco dalle attività
 */
export function calculateTotalPlaytime(activities: Activity[]): number {
  return activities
    .filter(a => a.type === 'Played' && a.additionalInfo)
    .reduce((total, activity) => {
      return total + extractHoursFromString(activity.additionalInfo);
    }, 0);
}

/**
 * Calcola il tempo di gioco nelle ultime due settimane
 */
export function calculateRecentPlaytime(activities: Activity[]): number {
  return activities
    .filter(a => a.type === 'Played' && a.additionalInfo && isInLastTwoWeeks(new Date(a.timestamp)))
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
    totalSessions: activities.filter(a => a.type === 'Played').length,
    totalCompletions: activities.filter(a => a.type === 'Completed').length,
    totalPlatinums: activities.filter(a => a.type === 'Platinum').length,
    totalPlaytime: calculateTotalPlaytime(activities),
    recentPlaytime: calculateRecentPlaytime(activities),
    lastUpdate
  };
}

/**
 * Calcola le statistiche mensili per un gruppo di attività
 */
export function calculateMonthlyStats(activities: Activity[]): MonthlyStats {
  const Played = activities.filter(a => a.type === 'Played').length;
  const Completed = activities.filter(a => a.type === 'Completed').length;
  const Rated = activities.filter(a => a.type === 'Rated').length;
  const hours = calculateTotalPlaytime(activities);
  
  return {
    total: activities.length,
    Played,
    Completed,
    Rated,
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
  if (filters.Types && filters.Types.length > 0) {
    filtered = filtered.filter(a => filters.Types!.includes(a.type));
  }
  
  // Filtra per anno
  if (filters.Year !== undefined) {
    filtered = filtered.filter(a => 
      new Date(a.timestamp).getFullYear() === filters.Year
    );
  }
  
  // Filtra per mese
  if (filters.Month !== undefined) {
    filtered = filtered.filter(a => 
      new Date(a.timestamp).getMonth() === filters.Month
    );
  }
  
  // Filtra per gioco
  if (filters.GameId !== undefined) {
    filtered = filtered.filter(a => a.gameId === filters.GameId);
  }
  
  // Applica ordinamento
  filtered = filters.SortDirection === 'asc'
    ? filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : sortActivitiesByDate(filtered);
  
  // Limita il numero di risultati
  if (filters.Limit !== undefined) {
    filtered = filtered.slice(0, filters.Limit);
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

export function getActivityIcon(type: ActivityType): React.ReactNode {
  switch(type) {
    case "Completed":
      return React.createElement(Trophy, { className: "h-5 w-5", style: { color: getActivityColor('Completed') } });
    case "Played":
      return React.createElement(Clock, { className: "h-5 w-5", style: { color: getActivityColor('Played') } });
    case "Added":
      return React.createElement(Gamepad2, { className: "h-5 w-5", style: { color: getActivityColor('Added') } });
    case "Rated":
      return React.createElement(Star, { className: "h-5 w-5", style: { color: getActivityColor('Rated') } });
    case "Platinum":
      return React.createElement(Award, { className: "h-5 w-5", style: { color: getActivityColor('Platinum') } });
    case "Abandoned":
      return React.createElement(X, { className: "h-5 w-5", style: { color: getActivityColor('Abandoned') } });
    default:
      return null;
  }
}

export function getActivitytext(activity: Activity): string {
  switch(activity.type) {
    case "Completed":
      return `Hai completato ${activity.gameTitle}`;    
    case "Played":
      // Controlla se l'additionalInfo contiene "ripreso", che indica un cambiamento di stato
      if (activity.additionalInfo && activity.additionalInfo.includes("ripreso")) {
        return `Hai ripreso a giocare a ${activity.gameTitle}`;
      }
      // Controlla se l'additionalInfo contiene "iniziato:", che indica la prima sessione di gioco
      if (activity.additionalInfo && activity.additionalInfo.includes("iniziato:")) {
        const ore = activity.additionalInfo.replace("iniziato:", "");
        return `Hai iniziato ${activity.gameTitle} e giocato ${ore}`;
      }
      // Controlla se l'additionalInfo contiene "impostato:", che indica modifica manuale delle ore
      if (activity.additionalInfo && activity.additionalInfo.includes("impostato:")) {
        const ore = activity.additionalInfo.replace("impostato:", "");
        return `Hai impostato ${ore} di gioco a ${activity.gameTitle}`;
      }
      // Controlla se l'additionalInfo inizia con "-", che indica rimozione di ore
      if (activity.additionalInfo && activity.additionalInfo.startsWith("-")) {
        return `Hai rimosso ${activity.additionalInfo.substring(1)} da ${activity.gameTitle}`;
      }
      return `Hai giocato ${activity.additionalInfo || ''} a ${activity.gameTitle}`;
    case "Added":
      return `Hai aggiunto ${activity.gameTitle} alla tua libreria`;
    case "Rated":
      return `Hai valutato ${activity.gameTitle} con ${activity.additionalInfo}`;
    case "Platinum":
      return `Hai platinato ${activity.gameTitle}`;
    case "Abandoned":
      return `Hai abbandonato ${activity.gameTitle} ${activity.additionalInfo ? activity.additionalInfo : ''}`;
    default:
      return '';
  }
}

// Le funzioni di creazione attività locali sono state rimosse in favore della creazione automatica lato backend
// Quando si eseguono operazioni sui giochi (aggiungere, modificare stato, ore, rating), 
// il backend crea automaticamente le attività corrispondenti tramite ActivityService