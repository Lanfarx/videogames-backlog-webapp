export type ActivityType = 
  | 'played'
  | 'completed'
  | 'added'
  | 'rated'
  | 'platinum'
  | 'abandoned';

export interface Activity {
  id: number;
  type: ActivityType;
  gameId: number;
  gameTitle: string;
  timestamp: Date;
  additionalInfo?: string;
}
