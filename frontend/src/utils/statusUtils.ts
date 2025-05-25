import { GameStatus } from '../types/game';
import { ActivityType } from '../types/activity';

import { 
  STATUS_COLORS, 
  STATUS_LABELS, 
} from '../constants/gameConstants';
import { useGamesStats } from '../store/hooks/gamesHooks';

export interface StatusItem {
  status: GameStatus | string;
  label: string;
  count: number;
  color: string;
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

export const gameStatusToActivityType: Record<GameStatus, ActivityType> = {
  'in-progress': 'played',
  'not-started': 'added',
  'completed': 'completed',
  'abandoned': 'abandoned',
  'platinum': 'platinum'
};