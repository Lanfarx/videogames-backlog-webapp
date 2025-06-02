import { GameStatus } from '../types/game';
import { ActivityType } from '../types/activity';

import { 
  Status_COLORS, 
  Status_LABELS, 
} from '../constants/gameConstants';
import { useGamesStats } from '../store/hooks/gamesHooks';

export interface StatusItem {
  Status: GameStatus | string;
  label: string;
  count: number;
  color: string;
}

/**
 * Genera i dati di stato per i grafici e le visualizzazioni
 * Ora usa lo stato globale tramite hook
 */
export function useStatusData(): StatusItem[] {
  const { stats } = useGamesStats();
  return Object.entries(Status_LABELS).map(([Status, label]) => ({
    Status: Status as GameStatus,
    label: label,
    count: getCountForStatus(stats, Status as GameStatus),
    color: Status_COLORS[Status as GameStatus]
  }));
}

function getCountForStatus(stats: any, Status: GameStatus): number {
  switch (Status) {
    case 'InProgress': return stats.inProgress;
    case 'NotStarted': return stats.notStarted;
    case 'Completed': return stats.completed - stats.platinum; // Completed senza platinum
    case 'Abandoned': return stats.abandoned;
    case 'Platinum': return stats.platinum;
    default: return 0;
  }
}

export const gameStatusToActivityType: Record<GameStatus, ActivityType> = {
  'InProgress': 'Played',
  'NotStarted': 'Added',
  'Completed': 'Completed',
  'Abandoned': 'Abandoned',
  'Platinum': 'Platinum'
};