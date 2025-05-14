// Definizione dei tipi di stato dei giochi
export type GameStatus = 'not-started' | 'in-progress' | 'completed' | 'abandoned' | 'platinum';

// Elenco delle piattaforme di gioco supportate
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

// Definizione delle opzioni di ordinamento
export type SortOption = 'title' | 'platform' | 'releaseYear' | 'rating' | 
'hoursPlayed' | 'price' | 'purchaseDate' | 'completionDate' | 'platinumDate' | 'metacritic';

// Definizione dell'ordine di ordinamento
export type SortOrder = 'asc' | 'desc';

// Definizione dei filtri per i giochi
export interface GameFilters {
  status: GameStatus[];
  platform: string[];
  genre: string[];
  priceRange: [number, number];
  hoursRange: [number, number];
  metacriticRange: [number, number];
  purchaseDate: string;
}

// Definizione della struttura di un gioco
export interface Game {
  id: number;
  title: string;
  platform: string;
  releaseYear: number;
  genres: string[];
  status: GameStatus;
  coverImage?: string;
  price: number;
  hoursPlayed: number;
  metacritic: number;
  rating: number;
  purchaseDate?: string;
  completionDate?: string;
  notes?: string;
  developer?: string;
  publisher?: string;
  platinumDate?: string;
  review?: GameReview;
  comments?: GameComment[];
}

// Definizione della struttura di una recensione
export interface GameReview {
  text: string;
  gameplay: number;
  graphics: number;
  story: number;
  sound: number;
  date: string;
}

// Definizione della struttura di un commento
export interface GameComment {
  id: number;
  date: string;
  text: string;
}