import type { GameStatus, GamePlatform, SortOption, SortOrder } from '../types/game';
import { ActivityType } from '../types/activity';
import { ColorMap, LabelMap } from '../types/stats';

/**
 * Definizioni di colori per stati di gioco
 */
export const STATUS_COLORS: ColorMap = {
  'not-started': '#9CA3AF', // grigio
  'in-progress': '#3B82F6', // blu
  'completed': '#10B981',   // verde
  'abandoned': '#EF4444',   // rosso
  'platinum': '#8B5CF6'     // viola
};

/**
 * Etichette in italiano per stati di gioco
 */
export const STATUS_LABELS: LabelMap = {
  'not-started': 'Da iniziare',
  'in-progress': 'In corso',
  'completed': 'Completato',
  'abandoned': 'Abbandonato',
  'platinum': 'Platinato'
};

/**
 * Opzioni di stato per select e form
 */
export const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  value: value as GameStatus,
  label,
  color: STATUS_COLORS[value]
}));

/**
 * Colori predefiniti per le piattaforme principali
 */
export const PLATFORM_COLORS: Record<string, string> = {
  'PlayStation 5': '#0070d1',
  'PlayStation 4': '#003087',
  'Xbox Series X/S': '#107c10',
  'Xbox One': '#5dc21e',
  'Nintendo Switch': '#e60012',
  'Steam': '#1b2838',
  'Epic Games Store': '#2a2a2a',
  'PC': '#00adef',
  'iOS': '#A2AAAD',
  'Android': '#3DDC84'
};

/**
 * Array di tutte le piattaforme disponibili
 */
export const GAME_PLATFORMS: GamePlatform[] = [
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
export const GENRES = [
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
  { value: 'platform', label: 'Piattaforma' },
  { value: 'releaseYear', label: 'Anno di uscita' },
  { value: 'rating', label: 'Valutazione' },
  { value: 'hoursPlayed', label: 'Ore giocate' },
  { value: 'price', label: 'Prezzo' },
  { value: 'purchaseDate', label: 'Data di acquisto' },
  { value: 'completionDate', label: 'Data di completamento' },
  { value: 'platinumDate', label: 'Data platino' },
  { value: 'metacritic', label: 'Metacritic' }
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
  price: [0, 80] as [number, number],
  hours: [0, 100] as [number, number],
  metacritic: [0, 100] as [number, number]
};

/**
 * Ottiene il colore associato a uno stato
 */
export function getStatusColor(status: string): string {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS['not-started'];
}

/**
 * Ottiene l'etichetta in italiano associata a uno stato
 */
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status as keyof typeof STATUS_LABELS] || 'Sconosciuto';
}

/**
 * Ottiene il colore associato a una piattaforma
 */
export function getPlatformColor(platform: string): string {
  return PLATFORM_COLORS[platform] || '#808080'; // Grigio come fallback
}

/**
 * Genera un colore causale, usato per piattaforme o generi senza colore predefinito
 */
export function getRandomColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * Mappa dei colori per tipi di attività
 */
export const ACTIVITY_COLORS: Record<string, string> = {
  'played': STATUS_COLORS['in-progress'],   // Come in-progress
  'added': STATUS_COLORS['not-started'],    // Come not-started
  'rated': '#8A5CF6',                       // Viola
  'completed': STATUS_COLORS['completed'],  // Come completed
  'abandoned': STATUS_COLORS['abandoned'],  // Come abandoned
  'platinum': STATUS_COLORS['platinum'],    // Come platinum
};

/**
 * Etichette in italiano per tipi di attività
 */
export const ACTIVITY_LABELS: Record<string, string> = {
  'played': 'Giocato',
  'added': 'Aggiunto',
  'rated': 'Valutato',
  'completed': STATUS_LABELS['completed'],
  'abandoned': STATUS_LABELS['abandoned'],
  'platinum': STATUS_LABELS['platinum'],
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