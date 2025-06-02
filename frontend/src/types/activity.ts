/**
 * Tipi di attività supportate nel sistema
 */
export type ActivityType = 
  | 'Played'      // Sessione di gioco
  | 'Completed'   // Completamento del gioco
  | 'Added'       // Aggiunta alla collezione
  | 'Rated'       // Recensione/valutazione
  | 'Platinum'    // Ottenimento di tutti i trofei/achievement
  | 'Abandoned';  // Abbandono del gioco

/**
 * Struttura base di un'attività
 */
export interface Activity {
  id: number;               // Identificativo univoco
  Type: ActivityType;       // Tipo di attività
  GameId: number;           // ID del gioco collegato
  GameTitle: string;        // Titolo del gioco
  Timestamp: string;        // Data e ora dell'attività (ISO string per serializzazione Redux)
  AdditionalInfo?: string;  // Informazioni aggiuntive (es. "5 ore", "dopo 2 ore")
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
  Types?: ActivityType[];  // Tipi di attività da includere
  Year?: number;           // Anno di riferimento
  Month?: number;          // Mese di riferimento
  GameId?: number;         // Gioco specifico
  Limit?: number;          // Numero massimo di risultati
  SortDirection?: 'asc' | 'desc'; // Direzione di ordinamento
}
