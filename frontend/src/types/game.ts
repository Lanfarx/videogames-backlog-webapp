/**
 * Definizione dei tipi di stato dei giochi
 */
export type GameStatus = 'NotStarted' | 'InProgress' | 'Completed' | 'Abandoned' | 'Platinum';

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
export type SortOption = 'title' | 'Platform' | 'ReleaseYear' | 'Rating' | 
'HoursPlayed' | 'Price' | 'PurchaseDate' | 'CompletionDate' | 'PlatinumDate' | 'Metacritic';

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
  Title: string;
  Platform: string;
  ReleaseYear: number;
  Genres: string[];
  Status: GameStatus;
  CoverImage?: string;
}

/**
 * Informazioni finanziarie del gioco
 */
export interface GameFinancialInfo {
  Price: number;
  PurchaseDate?: string;
}

/**
 * Informazioni sullo sviluppo del gioco
 */
export interface GameDevelopmentInfo {
  Developer?: string;
  Publisher?: string;
}

/**
 * Informazioni di completamento del gioco
 */
export interface GameCompletionInfo {
  CompletionDate?: string;
  PlatinumDate?: string;
}

/**
 * Informazioni di gioco
 */
export interface GamePlayInfo {
  HoursPlayed: number;
  Metacritic: number;
  Rating: number;
  Notes?: string;
}

/**
 * Definizione della struttura di una recensione
 */
export interface GameReview {
  Text: string;
  Gameplay: number;
  Graphics: number;
  Story: number;
  Sound: number;
  Date: string;
  IsPublic?: boolean; // true = pubblica, false/undefined = privata
}

/**
 * Definizione della struttura di un commento
 */
export interface GameComment {
  Id: number;
  Date: string;
  Text: string;
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
  Review?: GameReview;
  Comments?: GameComment[];
  }

/**
 * Definizione dei filtri per i giochi
 */
export interface GameFilters {
  Status: GameStatus[];
  Platform: string[];
  genre: string[];
  PriceRange: NumericRange;
  hoursRange: NumericRange;
  MetacriticRange: NumericRange;
  PurchaseDate: string;
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
export type GameInput = Omit<Game, 'id' | 'Rating' | 'Comments'>;

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
 * Questi giochi non hanno id, Platform obbligatorio, né Rating/commenti
 */
export interface SampleGame {
  id: string; // id RAWG come stringa
  title: string;
  CoverImage: string;
  ReleaseYear: number;
  Genres: string[];
  Metacritic: number;
}

/**
 * Definizione di un gioco per il catalogo pubblico
 */
export type PublicCatalogGame = {
  id?: number; // id RAWG opzionale
  title: string;
  description: string;
  CoverImage: string;
  Developer: string;
  Publisher: string;
  ReleaseYear: number;
  Genres: { id: number; name: string }[]; // ora oggetti con id e nome
  Metacritic: number;
  Platforms: string[];
  communityRating?: number;
  userReview?: {
    text: string;
    Gameplay: number;
    Graphics: number;
    Story: number;
    Sound: number;
    date: string;
  };
};