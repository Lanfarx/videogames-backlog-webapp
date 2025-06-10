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
  type: ActivityType;       // Tipo di attività
  gameId: number;           // ID del gioco collegato
  gameTitle: string;        // Titolo del gioco
  timestamp: string;        // Data e ora dell'attività (ISO string per serializzazione Redux)
  additionalInfo?: string;  // Informazioni aggiuntive (es. "5 ore", "dopo 2 ore")
  gameImageUrl?: string;    // URL dell'immagine del gioco (se disponibile)
  comments?: ActivityComment[];    // Lista dei commenti (opzionale)
  commentsCount?: number;          // Numero totale di commenti (opzionale)
}

/**
 * Reazione emoji a un'attività
 */
export interface ActivityReaction {
  id: number;              // Identificativo univoco della reazione
  activityId: number;      // ID dell'attività a cui si riferisce
  userId: number;          // ID dell'utente che ha reagito
  userUserName: string;    // Username dell'utente che ha reagito
  emoji: string;           // Emoji utilizzata per la reazione
  createdAt: string;       // Data e ora della reazione
}

/**
 * Sommario delle reazioni raggruppate per emoji
 */
export interface ActivityReactionSummary {
  emoji: string;           // Emoji della reazione
  count: number;           // Numero di utenti che hanno reagito con questa emoji
  userNames: string[];     // Lista degli username che hanno reagito
}

/**
 * Commento a un'attività
 */
export interface ActivityComment {
  id: number;              // Identificativo univoco del commento
  text: string;            // Testo del commento
  date: string;            // Data e ora del commento
  activityId: number;      // ID dell'attività commentata
  authorId: number;        // ID dell'autore del commento
  authorUsername: string;  // Username dell'autore
  authorAvatar?: string;   // Avatar dell'autore (opzionale)
}

/**
 * DTO per creare un nuovo commento a un'attività
 */
export interface CreateActivityCommentDto {
  text: string;            // Testo del commento
  activityId: number;      // ID dell'attività da commentare
}

/**
 * Attività con le sue reazioni
 */
export interface ActivityWithReactions extends Activity {
  reactions: ActivityReaction[];                    // Lista di tutte le reazioni
  reactionSummary: ActivityReactionSummary[];      // Sommario delle reazioni raggruppate
}

/**
 * Attività con reazioni e commenti
 */
export interface ActivityWithReactionsAndComments extends ActivityWithReactions {
  comments: ActivityComment[];                     // Lista dei commenti
  commentsCount: number;                          // Numero totale di commenti
}

/**
 * DTO per creare una nuova reazione
 */
export interface CreateActivityReactionDto {
  activityId: number;      // ID dell'attività
  emoji: string;           // Emoji da utilizzare
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
