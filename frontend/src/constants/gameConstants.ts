import type { GameStatus, GamePlatform } from '../types/game';

// Mappa degli stati ai colori
export const STATUS_COLORS: Record<GameStatus, string> = {
  'not-started': '#FFCC3F',
  'in-progress': '#FB7E00',
  'completed': '#9FC089',
  'abandoned': '#F44336',
  'platinum': '#9370DB',
};

// Mappa degli stati ai nomi visualizzati
export const STATUS_NAMES: Record<GameStatus, string> = {
  'not-started': 'Da iniziare',
  'in-progress': 'In corso',
  'completed': 'Completato',
  'abandoned': 'Abbandonato',
  'platinum': 'Platinato',
};

// Opzioni di stato per i form
export const STATUS_OPTIONS = [
  { value: 'not-started', label: 'Da iniziare', color: '#FFCC3F' },
  { value: 'in-progress', label: 'In corso', color: '#FB7E00' },
  { value: 'completed', label: 'Completato', color: '#9FC089' },
  { value: 'platinum', label: 'Platinato', color: '#9370DB' },
  { value: 'abandoned', label: 'Abbandonato', color: '#F44336' },
];

// Array di tutte le piattaforme disponibili
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

// Generi disponibili
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

// Opzioni di ordinamento
export const SORT_OPTIONS = [
  { id: 'title', label: 'Titolo' },
  { id: 'platform', label: 'Piattaforma' },
  { id: 'releaseYear', label: 'Anno di uscita' },
  { id: 'rating', label: 'Valutazione' },
  { id: 'metacritic', label: 'Metacritic' }, // Aggiungiamo l'opzione Metacritic
  { id: 'hoursPlayed', label: 'Ore di gioco' },
  { id: 'price', label: 'Prezzo' },
  { id: 'purchaseDate', label: 'Data di acquisto' },
  { id: 'completionDate', label: 'Data di completamento' },
  { id: 'platinumDate', label: 'Data di platino' },
];