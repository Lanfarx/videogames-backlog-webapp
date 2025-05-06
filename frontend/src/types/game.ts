export type GameStatus = "not-started" | "in-progress" | "completed" | 
"platinum" | "abandoned" | "wishlist" 

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
  review?: GameReview
  timeline?: TimelineEvent[]
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

export interface TimelineEvent {
  date: string
  hours: number
  event: string
}

export interface GameComment {
  id: number
  date: string
  text: string
}