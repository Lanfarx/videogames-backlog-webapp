/**
 * Definizione dei tipi di stato dei giochi
 */
export type GameStatus = 'not-started' | 'in-progress' | 'completed' | 'abandoned' | 'platinum';

/**
 * Elenco delle piattaforme di gioco supportate
 */
export type GamePlatform = 
  'PlayStation 5' | 
  'PlayStation 4' | 
  'PlayStation 3' | 
  'Xbox Series X/S' | 
  'Xbox One' | 
  'Nintendo Switch' | 
  'Steam' | 
  'Epic Games Store' | 
  'GOG' | 
  'iOS' | 
  'Android';

/**
 * Definizione delle opzioni di ordinamento
 */
export type SortOption = 'title' | 'platform' | 'releaseYear' | 'rating' | 
'hoursPlayed' | 'price' | 'purchaseDate' | 'completionDate' | 'platinumDate' | 'metacritic';

/**
 * Definizione dell'ordine di ordinamento
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Range numerico [min, max]
 */
export type NumericRange = [number, number];

/**
 * Metadati di base di un gioco
 */
export interface GameBasicInfo {
  id: number;
  title: string;
  platform: string;
  releaseYear: number;
  genres: string[];
  status: GameStatus;
  coverImage?: string;
}

/**
 * Informazioni finanziarie del gioco
 */
export interface GameFinancialInfo {
  price: number;
  purchaseDate?: string;
}

/**
 * Informazioni sullo sviluppo del gioco
 */
export interface GameDevelopmentInfo {
  developer?: string;
  publisher?: string;
}

/**
 * Informazioni di completamento del gioco
 */
export interface GameCompletionInfo {
  completionDate?: string;
  platinumDate?: string;
}

/**
 * Informazioni di gioco
 */
export interface GamePlayInfo {
  hoursPlayed: number;
  metacritic: number;
  rating: number;
  notes?: string;
}

/**
 * Definizione della struttura di una recensione
 */
export interface GameReview {
  text: string;
  gameplay: number;
  graphics: number;
  story: number;
  sound: number;
  date: string;
}

/**
 * Definizione della struttura di un commento
 */
export interface GameComment {
  id: number;
  date: string;
  text: string;
}

/**
 * Definizione completa della struttura di un gioco
 * che unisce tutte le interfacce precedenti
 */
export interface Game extends 
  GameBasicInfo,
  GameFinancialInfo,
  GameDevelopmentInfo,
  GameCompletionInfo,
  GamePlayInfo {
  review?: GameReview;
  comments?: GameComment[];
}

/**
 * Definizione dei filtri per i giochi
 */
export interface GameFilters {
  status: GameStatus[];
  platform: string[];
  genre: string[];
  priceRange: NumericRange;
  hoursRange: NumericRange;
  metacriticRange: NumericRange;
  purchaseDate: string;
}

/**
 * Parametri di ricerca dei giochi
 */
export interface GameSearchParams {
  query?: string;
  filters?: Partial<GameFilters>;
  sortBy?: SortOption;
  sortOrder?: SortOrder;
  limit?: number;
  offset?: number;
}

/**
 * Input per aggiungere un nuovo gioco
 * Omette i campi che vengono generati automaticamente
 */
export type GameInput = Omit<Game, 'id' | 'rating' | 'comments'>;

/**
 * Input per aggiornare un gioco esistente
 * Rende tutti i campi opzionali
 */
export type GameUpdateInput = Partial<Game>;

/**
 * Opzioni di visualizzazione per i giochi
 */
export type GameViewMode = 'grid' | 'list';

/**
 * Tipo per i giochi di esempio usati nella ricerca automatica (sample games)
 * Questi giochi non hanno id, platform obbligatorio, né rating/commenti
 */
export interface SampleGame {
  title: string;
  coverImage: string;
  developer: string;
  publisher: string;
  releaseYear: number;
  genres: string[];
  metacritic: number;
}