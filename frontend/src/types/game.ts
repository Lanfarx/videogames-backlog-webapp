export type GameStatus = 
  | 'in-progress'
  | 'not-started'
  | 'completed'
  | 'abandoned'
  | 'platinum';

export type Platform = string

export type Genre = string

export interface Game {
  id: number
  title: string
  coverImage: string
  developer: string
  publisher: string
  releaseYear: number
  genres: Genre[]
  platform: Platform
  status: GameStatus
  hoursPlayed: number
  purchaseDate: string
  price: number
  rating: number
  notes: string
  completionDate?: string  // Data di completamento del gioco
  platinumDate?: string    // Data di platino del gioco
  review?: GameReview
  comments?: GameComment[]
}

export interface GameReview {
  text: string
  gameplay: number
  graphics: number
  story: number
  sound: number
  date: string
}

export interface GameComment {
  id: number
  date: string
  text: string
}