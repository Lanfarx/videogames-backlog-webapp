/**
 * Definizioni dei tipi per le statistiche e i dati aggregati
 */

/**
 * Statistiche delle attività
 */
export interface ActivityStats {
  totalEntries: number;        // Totale di tutte le attività
  totalSessions: number;       // Numero di sessioni di gioco
  totalCompletions: number;    // Numero di completamenti
  totalPlatinums: number;      // Numero di platinati
  totalPlaytime: number;       // Ore totali di gioco
  recentPlaytime: number;      // Ore di gioco recenti (ultimi 14 giorni)
  lastUpdate: Date | null;     // Data dell'ultimo aggiornamento
}

/**
 * Statistiche di un singolo mese per il diario
 */
export interface MonthlyStats {
  total: number;               // Totale attività nel mese
  Completed: number;           // Completamenti nel mese
  Played: number;              // Sessioni nel mese 
  Rated: number;               // Recensioni nel mese
  hours: number;               // Ore giocate nel mese
}

/**
 * Statistiche complessive dei giochi
 */
export interface GameStats {
  total: number;               // Totale giochi
  inProgress: number;          // Giochi in corso
  Completed: number;           // Giochi completati
  notStarted: number;          // Giochi non iniziati
  Abandoned: number;           // Giochi abbandonati
  Platinum: number;            // Giochi platinati
  totalHours: number;          // Ore totali giocate
}

/**
 * Dati per grafici di distribuzione
 */
export interface ChartItem {
  label: string;
  value: number;
  color: string;
}

/**
 * Mappa un tipo di attività/stato al suo colore
 */
export type ColorMap = Record<string, string>;

/**
 * Mappa un tipo di attività/stato alla sua etichetta
 */
export type LabelMap = Record<string, string>;