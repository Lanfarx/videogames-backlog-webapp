/**
 * Tipi di attività supportate nel sistema
 */
export type ActivityType = 
  | 'played'      // Sessione di gioco
  | 'completed'   // Completamento del gioco
  | 'added'       // Aggiunta alla collezione
  | 'rated'       // Recensione/valutazione
  | 'platinum'    // Ottenimento di tutti i trofei/achievement
  | 'abandoned';  // Abbandono del gioco

/**
 * Struttura base di un'attività
 */
export interface Activity {
  id: number;               // Identificativo univoco
  type: ActivityType;       // Tipo di attività
  gameId: number;           // ID del gioco collegato
  gameTitle: string;        // Titolo del gioco
  timestamp: Date;          // Data e ora dell'attività
  additionalInfo?: string;  // Informazioni aggiuntive (es. "5 ore", "dopo 2 ore")
}

/**
 * Dati delle attività aggregati per mese e anno
 */
export interface ActivityGroup {
  year: number;          // Anno di riferimento
  month: number;         // Mese di riferimento (0-11)
  activities: Activity[]; // Attività nel gruppo
}

/**
 * Parametri per filtrare le attività
 */
export interface ActivityFilters {
  types?: ActivityType[];  // Tipi di attività da includere
  year?: number;           // Anno di riferimento
  month?: number;          // Mese di riferimento
  gameId?: number;         // Gioco specifico
  limit?: number;          // Numero massimo di risultati
  sortDirection?: 'asc' | 'desc'; // Direzione di ordinamento
}

/**
 * Informazioni specifiche per il tipo di attività "played"
 */
export interface PlayedActivityData {
  hours: number;                   // Ore giocate nella sessione
  isFirstSessionOfMonth: boolean;  // Indica se è la prima sessione nel mese
}

/**
 * Informazioni specifiche per il tipo di attività "abandoned"
 */
export interface AbandonedActivityData {
  reason?: string;                 // Motivo dell'abbandono
  hoursPlayed?: number;            // Ore giocate prima di abbandonare
}

/**
 * Informazioni specifiche per il tipo di attività "rated"
 */
export interface RatedActivityData {
  rating: number;                  // Valutazione (1-10)
  reviewText?: string;             // Testo della recensione
  hoursPlayed?: number;            // Ore giocate prima della recensione
}

/**
 * Informazioni specifiche per il tipo di attività "completed"/"platinum"
 */
export interface CompletionActivityData {
  hoursToComplete: number;         // Ore impiegate per completare il gioco
  completionDate: Date;            // Data di completamento
}
