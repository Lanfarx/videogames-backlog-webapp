import { Activity, ActivityType, ActivityGroup, ActivityFilters, PlayedActivityData } from '../types/activity';
import { ActivityStats, MonthlyStats } from '../types/stats';
import { extractHoursFromString, isInLastTwoWeeks } from './dateUtils';
import { getActivityColor } from '../constants/gameConstants';
import { Trophy, Clock, Gamepad2, Star, Award, X } from 'lucide-react';
import React from 'react';
import { Game } from '../types/game';
import { gameStatusToActivityType } from './statusUtils';

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
 * Ottieni dati specifici per le attività di tipo "played"
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
  const played = activities.filter(a => a.type === 'played').length;
  const Completed = activities.filter(a => a.type === 'Completed').length;
  const rated = activities.filter(a => a.type === 'rated').length;
  const hours = calculateTotalPlaytime(activities);
  
  return {
    total: activities.length,
    played,
    Completed,
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

export function getActivityIcon(type: ActivityType): React.ReactNode {
  switch(type) {
    case "Completed":
      return React.createElement(Trophy, { className: "h-5 w-5", style: { color: getActivityColor('Completed') } });
    case "played":
      return React.createElement(Clock, { className: "h-5 w-5", style: { color: getActivityColor('played') } });
    case "added":
      return React.createElement(Gamepad2, { className: "h-5 w-5", style: { color: getActivityColor('added') } });
    case "rated":
      return React.createElement(Star, { className: "h-5 w-5", style: { color: getActivityColor('rated') } });
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
    case "played":
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
    case "added":
      return `Hai aggiunto ${activity.gameTitle} alla tua libreria`;
    case "rated":
      return `Hai valutato ${activity.gameTitle} con ${activity.additionalInfo}`;
    case "Platinum":
      return `Hai platinato ${activity.gameTitle}`;
    case "Abandoned":
      return `Hai abbandonato ${activity.gameTitle} ${activity.additionalInfo ? activity.additionalInfo : ''}`;
    default:
      return '';
  }
}

/**
 * Crea un'attività generica
 */
export function createActivity(gameId: number, gameTitle: string, type: ActivityType, additionalInfo?: string): Activity {
  return {
    id: Date.now(),
    type,
    gameId,
    gameTitle,
    timestamp: new Date(),
    additionalInfo
  };
}

/**
 * Crea un'attività per il cambio di stato di un gioco
 */
export function createStatusChangeActivity(game: Game, newStatus: Game["Status"], prevStatus?: Game["Status"]): Activity {
  const activityType = gameStatusToActivityType[newStatus];
  let additionalInfo;
  
  // Gestisci il caso specifico di ripresa del gioco (da abbandonato/completato/platinato a in corso)
  if (newStatus === 'InProgress' && 
      prevStatus && 
      (prevStatus === 'Abandoned' || prevStatus === 'Completed' || prevStatus === 'Platinum')) {
    additionalInfo = 'ripreso';
  }
  
  return createActivity(game.id, game.Title, activityType, additionalInfo);
}

/**
 * Crea un'attività per l'aggiunta di ore di gioco
 */
export function createPlaytimeActivity(game: Game, hoursAdded: number, isFirstSession: boolean = false): Activity {
  let additionalInfo;
  
  if (isFirstSession) {
    // Se è la prima sessione, usa il prefisso "iniziato:"
    additionalInfo = `iniziato:${Math.abs(hoursAdded)} ore`;
  } else if (hoursAdded < 0) {
    // Se si stanno rimuovendo ore, indicalo nel messaggio
    additionalInfo = `-${Math.abs(hoursAdded)} ore`;
  } else {
    additionalInfo = `${hoursAdded} ore`;
  }
  
  return createActivity(game.id, game.Title, 'played', additionalInfo);
}

/**
 * Crea un'attività per l'impostazione manuale delle ore di gioco
 */
export function createManualPlaytimeActivity(game: Game, newHours: number): Activity {
  const additionalInfo = `impostato:${newHours} ore`;
  return createActivity(game.id, game.Title, 'played', additionalInfo);
}

/**
 * Crea un'attività per la valutazione di un gioco
 */
export function createRatingActivity(game: Game, Rating: number): Activity {
  return createActivity(game.id, game.Title, 'rated', `${Rating.toFixed(1)} stelle`);
}

/**
 * Gestisci l'aggiornamento delle ore di gioco e crea le attività appropriate
 */
export function handlePlaytimeUpdate(game: Game, newHours: number): {
  StatusChanged: boolean;
  activity: Activity;
} {
  const wasNotStarted = game.Status === 'NotStarted';
  const hoursToAdd = newHours - game.HoursPlayed;
  let activity;
  
  // Se il gioco era "Da iniziare" e ora ha ore di gioco
  if (wasNotStarted && newHours > 0) {
    activity = createPlaytimeActivity(game, hoursToAdd, true);
    return { StatusChanged: true, activity };
  } else {
    // Caso normale: attività per le ore aggiunte
    activity = createPlaytimeActivity(game, hoursToAdd);
    return { StatusChanged: false, activity };
  }
}