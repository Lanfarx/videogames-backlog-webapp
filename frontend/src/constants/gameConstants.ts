import type { GameStatus, GamePlatform, SortOption, SortOrder } from '../types/game';
import { ColorMap, LabelMap } from '../types/stats';
import { getCssVarColor } from '../utils/getCssVarColor';

/**
 * Definizioni di colori per stati di gioco usando variabili CSS dedicate
 */
export const Status_COLORS: ColorMap = {
  'NotStarted': getCssVarColor('--Status-NotStarted', '#9CA3AF'),
  'InProgress': getCssVarColor('--Status-InProgress', '#3B82F6'),
  'Completed': getCssVarColor('--Status-Completed', '#10B981'),
  'Abandoned': getCssVarColor('--Status-Abandoned', '#EF4444'),
  'Platinum': getCssVarColor('--Status-Platinum', '#8B5CF6')
};

/**
 * Etichette in italiano per stati di gioco
 */
export const Status_LABELS: LabelMap = {
  'NotStarted': 'Da iniziare',
  'InProgress': 'In corso',
  'Completed': 'Completato',
  'Abandoned': 'Abbandonato',
  'Platinum': 'Platinato'
};

/**
 * Opzioni di stato per select e form
 */
export const Status_OPTIONS = Object.entries(Status_LABELS).map(([value, label]) => ({
  value: value as GameStatus,
  label,
  color: Status_COLORS[value]
}));

/**
 * Colori predefiniti per le piattaforme principali usando variabili CSS
 */
export const Platform_COLORS: Record<string, string> = {
  'PlayStation 5': getCssVarColor('--Platform-ps5', '#0070d1'),
  'PlayStation 4': getCssVarColor('--Platform-ps4', '#003087'),
  'Xbox Series X/S': getCssVarColor('--Platform-xbox-series', '#107c10'),
  'Xbox One': getCssVarColor('--Platform-xbox-one', '#5dc21e'),
  'Nintendo Switch': getCssVarColor('--Platform-switch', '#e60012'),
  'Steam': getCssVarColor('--Platform-steam', '#1b2838'),
  'Epic Games Store': getCssVarColor('--Platform-epic', '#2a2a2a'),
  'PC': getCssVarColor('--Platform-pc', '#00adef'),
  'iOS': getCssVarColor('--Platform-ios', '#A2AAAD'),
  'Android': getCssVarColor('--Platform-android', '#3DDC84')
};

/**
 * Array di tutte le piattaforme disponibili
 */
export const GAME_PlatformS: GamePlatform[] = [
  'PlayStation 5',
  'PlayStation 4',
  'PlayStation 3',
  'Xbox Series X/S',
  'Xbox One',
  'Nintendo Switch',
  'Steam',
  'Epic Games Store',
  'GOG',
  'iOS',
  'Android'
];

/**
 * Generi di giochi disponibili
 */
export const Genres = [
  'Action',
  'Adventure',
  'RPG',
  'Strategy',
  'Simulation',
  'Sports',
  'Racing',
  'Puzzle',
  'FPS',
  'Platform',
  'Fighting',
  'Horror',
  'Open World',
  'Sci-Fi',
  'Fantasy',
];

/**
 * Opzioni di ordinamento per i giochi
 */
export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'title', label: 'Titolo' },
  { value: 'Platform', label: 'Piattaforma' },
  { value: 'HoursPlayed', label: 'Ore giocate' },
  { value: 'Metacritic', label: 'Metacritic' },
  { value: 'Rating', label: 'Valutazione' },
  { value: 'Price', label: 'Prezzo' },
  { value: 'PurchaseDate', label: 'Data di acquisto' },
  { value: 'CompletionDate', label: 'Data di completamento' },
  { value: 'PlatinumDate', label: 'Data platino' },
];

/**
 * Opzioni per direzione dell'ordinamento
 */
export const SORT_DIRECTIONS: { value: SortOrder; label: string; icon: string }[] = [
  { value: 'asc', label: 'Crescente', icon: '↑' },
  { value: 'desc', label: 'Decrescente', icon: '↓' }
];

/**
 * Range predefiniti per filtri numerici
 */
export const DEFAULT_RANGES = {
  Price: [0, 80] as [number, number],
  hours: [0, 100] as [number, number],
  Metacritic: [0, 100] as [number, number]
};

/**
 * Ottiene il colore associato a uno stato
 */
export function getStatusColor(Status: string): string {
  return Status_COLORS[Status as keyof typeof Status_COLORS] || Status_COLORS['NotStarted'];
}

/**
 * Ottiene l'etichetta in italiano associata a uno stato
 */
export function getStatusLabel(Status: string): string {
  return Status_LABELS[Status as keyof typeof Status_LABELS] || 'Sconosciuto';
}

/**
 * Ottiene il colore associato a una piattaforma
 */
export function getPlatformColor(Platform: string): string {
  return Platform_COLORS[Platform] || '#808080'; // Grigio come fallback
}

/**
 * Genera un colore causale, usato per piattaforme o generi senza colore predefinito
 */
export function getRandomColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * Mappa dei colori per tipi di attività usando variabili CSS dedicate
 */
export const ACTIVITY_COLORS: Record<string, string> = {
  'Played': getCssVarColor('--activity-Played', Status_COLORS['InProgress']),
  'Added': getCssVarColor('--activity-Added', Status_COLORS['NotStarted']),
  'Rated': getCssVarColor('--activity-Rated', '#F59E0B'),
  'Completed': getCssVarColor('--activity-Completed', Status_COLORS['Completed']),
  'Abandoned': getCssVarColor('--activity-Abandoned', Status_COLORS['Abandoned']),
  'Platinum': getCssVarColor('--activity-Platinum', Status_COLORS['Platinum'])
};

/**
 * Etichette in italiano per tipi di attività
 */
export const ACTIVITY_LABELS: Record<string, string> = {
  'Played': 'Giocato',
  'Added': 'Aggiunto',
  'Rated': 'Valutato',
  'Completed': Status_LABELS['Completed'],
  'Abandoned': Status_LABELS['Abandoned'],
  'Platinum': Status_LABELS['Platinum'],
};

/**
 * Ottiene il colore per un tipo di attività
 */
export function getActivityColor(activityType: string): string {
  return ACTIVITY_COLORS[activityType] || '#CCCCCC'; // Colore di fallback grigio
}

/**
 * Ottiene l'etichetta in italiano per un tipo di attività
 */
export function getActivityLabel(activityType: string): string {
  return ACTIVITY_LABELS[activityType] || activityType;
}