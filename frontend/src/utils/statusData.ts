import { GameStatus } from '../types/game';
import { getGamesStats } from './gamesData';
import { ActivityType } from '../types/activity';

export interface StatusItem {
  status: GameStatus | string;
  label: string;
  count: number;
  color: string;
}

/**
 * Mappa dei colori fissi per gli stati dei giochi e tipi di attività
 */
export const statusColors: Record<string, string> = {
  // Colori stati giochi
  'in-progress': '#FB7E00', // Arancione fisso
  'not-started': '#FFCC3F', // Giallo fisso
  'completed': '#9FC089',   // Verde fisso
  'abandoned': '#F44336',   // Rosso fisso
  'platinum': '#C0C0C0',    // Argento/platino fisso
  
  // Colori tipi attività (stessi dei relativi stati)
  'played': '#FB7E00',      // Come in-progress
  'added': '#FFCC3F',       // Come not-started
  'rated': '#8A5CF6',       // Viola
};

/**
 * Etichette in italiano per gli stati dei giochi
 */
export const statusLabels: Record<string, string> = {
  // Stati giochi
  'in-progress': 'In corso',
  'not-started': 'Da iniziare',
  'completed': 'Completato',
  'abandoned': 'Abbandonato',
  'platinum': 'Platinato',
  
  // Tipi attività
  'played': 'Giocato',
  'added': 'Aggiunto',
  'rated': 'Valutato',
};

/**
 * Ottiene il colore per un determinato stato o tipo di attività
 */
export function getStatusColor(statusOrType: string): string {
  return statusColors[statusOrType] || '#CCCCCC'; // Colore di fallback grigio
}

/**
 * Ottiene l'etichetta in italiano per un determinato stato o tipo di attività
 */
export function getStatusLabel(statusOrType: string): string {
  return statusLabels[statusOrType] || statusOrType;
}

/**
 * Genera i dati di stato per i grafici e le visualizzazioni
 */
export function getStatusData(): StatusItem[] {
  const stats = getGamesStats();
  
  return [
    { status: 'in-progress', label: statusLabels['in-progress'], count: stats.inProgress, color: statusColors['in-progress'] },
    { status: 'not-started', label: statusLabels['not-started'], count: stats.notStarted, color: statusColors['not-started'] },
    { status: 'completed', label: statusLabels['completed'], count: stats.completed, color: statusColors['completed'] },
    { status: 'abandoned', label: statusLabels['abandoned'], count: stats.abandoned, color: statusColors['abandoned'] },
    { status: 'platinum', label: statusLabels['platinum'], count: stats.platinum, color: statusColors['platinum'] },
  ];
}
