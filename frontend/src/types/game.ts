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

export interface GameReview {
  text: string;
  gameplay: number;
  graphics: number;
  story: number;
  sound: number;
  date: string;
}

export interface GameComment {
  id: number;
  date: string;
  text: string;
}

export interface Game {
  id: number;
  title: string;
  coverImage: string;
  developer: string;
  publisher: string;
  releaseYear: number;
  genres: string[];
  platform: string;
  hoursPlayed: number;
  status: GameStatus;
  purchaseDate: string;
  price: number;
  completionDate?: string;
  platinumDate?: string;
  notes?: string;
  review?: GameReview;
  comments?: GameComment[];
}