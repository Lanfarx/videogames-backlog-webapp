export type ActivityType = 
  | "completed" 
  | "played" 
  | "added" 
  | "rated" 
  | "platinum" 
  | "abandoned" 
  | "wishlisted";

export interface Activity {
  id: number;
  type: ActivityType;
  gameId: number;
  gameTitle: string;
  timestamp: Date; 
  additionalInfo?: string; 
}
