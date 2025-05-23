import { GameStatus } from '../types/game';
import { useGamesStats } from './gamesHooks';
import { 
  STATUS_COLORS, 
  STATUS_LABELS, 
  ACTIVITY_COLORS,
  ACTIVITY_LABELS,
  getStatusColor as getGameStatusColor,
  getStatusLabel as getGameStatusLabel,
  getActivityColor,
  getActivityLabel
} from '../constants/gameConstants';

export interface StatusItem {
  status: GameStatus | string;
  label: string;
  count: number;
  color: string;
}

/**
 * Ottiene il colore per un determinato stato o tipo di attività
 * @deprecated Utilizzare getStatusColor o getActivityColor dal file constants/gameConstants.ts
 */
export function getStatusColor(statusOrType: string): string {
  // Prima controlla se è uno stato di gioco
  if (statusOrType in STATUS_COLORS) {
    return getGameStatusColor(statusOrType);
  }
  // Altrimenti controlla se è un tipo di attività
  if (statusOrType in ACTIVITY_COLORS) {
    return getActivityColor(statusOrType);
  }
  // Fallback
  return '#CCCCCC';
}

/**
 * Ottiene l'etichetta in italiano per un determinato stato o tipo di attività
 * @deprecated Utilizzare getStatusLabel o getActivityLabel dal file constants/gameConstants.ts
 */
export function getStatusLabel(statusOrType: string): string {
  // Prima controlla se è uno stato di gioco
  if (statusOrType in STATUS_LABELS) {
    return getGameStatusLabel(statusOrType);
  }
  // Altrimenti controlla se è un tipo di attività
  if (statusOrType in ACTIVITY_LABELS) {
    return getActivityLabel(statusOrType);
  }
  // Fallback
  return statusOrType;
}

/**
 * Genera i dati di stato per i grafici e le visualizzazioni
 * Ora usa lo stato globale tramite hook
 */
export function useStatusData(): StatusItem[] {
  const stats = useGamesStats();
  return Object.entries(STATUS_LABELS).map(([status, label]) => ({
    status: status as GameStatus,
    label: label,
    count: getCountForStatus(stats, status as GameStatus),
    color: STATUS_COLORS[status as GameStatus]
  }));
}

function getCountForStatus(stats: any, status: GameStatus): number {
  switch (status) {
    case 'in-progress': return stats.inProgress;
    case 'not-started': return stats.notStarted;
    case 'completed': return stats.completed;
    case 'abandoned': return stats.abandoned;
    case 'platinum': return stats.platinum;
    default: return 0;
  }
}