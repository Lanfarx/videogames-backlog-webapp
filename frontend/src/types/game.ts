export type GameStatus = "not-started" | "in-progress" | "completed" | "platinum" | "abandoned" | "wishlist" 

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
}