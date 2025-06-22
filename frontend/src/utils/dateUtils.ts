/**
 * Intervalli di tempo per il calcolo relativo
 */
interface TimeInterval {
  unit: string;
  singularUnit: string;
  value: number;
  limit: number;
}

/**
 * Formatta la data in formato compatto con l'anno sotto quando necessario
 */
export function formatShortDate(date: Date | string, previousDate?: Date | string, isLastPoint: boolean = false): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const previousDateObj = previousDate ? (typeof previousDate === 'string' ? new Date(previousDate) : previousDate) : undefined;
  
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('it-IT', { month: 'short' }).substring(0, 3);
  const year = dateObj.getFullYear();
  const currentYear = new Date().getFullYear();
  
  // Determina se mostrare l'anno
  const showYear = (previousDateObj && previousDateObj.getFullYear() !== year) || (year !== currentYear);
  
  // Ritorna la data con l'anno su due righe quando necessario
  if (showYear) {
    return `${day} ${month}\n${year}`; // Utilizza \n per forzare un'andata a capo
  }
  
  return `${day} ${month}`;
}

/**
 * Formatta la data in formato "gg/mm/yyyy"
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('it-IT');
}

/**
 * Formatta l'ultimo aggiornamento in modo leggibile (es. "15 giu 2023")
 */
export function formatLastUpdate(date: Date | null): string {
  if (!date) return '-';
  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Formatta una data in un formato relativo leggibile (es. "2 giorni fa")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInSec = Math.floor(diffInMs / 1000);
  
  // Definizione degli intervalli di tempo
  const intervals: TimeInterval[] = [
    { unit: 'minuti', singularUnit: 'minuto', value: diffInSec / 60, limit: 60 },
    { unit: 'ore', singularUnit: 'ora', value: diffInSec / 3600, limit: 24 },
    { unit: 'giorni', singularUnit: 'giorno', value: diffInSec / 86400, limit: 7 },
    { unit: 'settimane', singularUnit: 'settimana', value: diffInSec / 604800, limit: 4 },
    { unit: 'mesi', singularUnit: 'mese', value: diffInSec / 2592000, limit: 12 },
    { unit: 'anni', singularUnit: 'anno', value: diffInSec / 31536000, limit: Infinity }
  ];

  if (diffInSec < 60) {
    return "Adesso";
  }
  
  // Trova il primo intervallo appropriato
  for (const interval of intervals) {
    const value = Math.floor(interval.value);
    if (value < interval.limit) {
      const unit = value === 1 ? interval.singularUnit : interval.unit;
      return `${value} ${unit} fa`;
    }
  }
  
  // Fallback per date molto vecchie
  const years = Math.floor(diffInSec / 31536000);
  return `${years} ${years === 1 ? 'anno' : 'anni'} fa`;
}

/**
 * Ottiene il nome del mese in italiano
 */
export function getMonthName(month: number, format: 'short' | 'long' = 'long'): string {
  return new Date(2000, month).toLocaleString('it-IT', { 
    month: format === 'short' ? 'short' : 'long' 
  });
}

/**
 * Controlla se una data è nelle ultime due settimane
 */
export function isInLastTwoWeeks(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  return dateObj >= twoWeeksAgo;
}

/**
 * Controlla se una data è nell'ultimo mese
 */
export function isInLastMonth(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  return dateObj >= oneMonthAgo;
}

/**
 * Estrae le ore da una stringa (es. "5 ore" -> 5)
 */
export function extractHoursFromString(text: string | undefined): number {
  if (!text) return 0;
  const hoursMatch = text.match(/(\d+)\s*ore/);
  return hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
}

/**
 * Formatta le ore in una stringa (es. 5 -> "5 ore")
 */
export function formatHours(hours: number): string {
  return `${hours} ${hours === 1 ? 'ora' : 'ore'}`;
}

/**
 * Calcola i giorni di attività dall'iscrizione
 */
export function calculateActivityDays(memberSince: Date | string): number {
  const memberSinceDate = typeof memberSince === 'string' ? new Date(memberSince) : memberSince;
  
  // Normalizza entrambe le date alla mezzanotte UTC per un calcolo preciso dei giorni
  const memberSinceUTC = new Date(Date.UTC(
    memberSinceDate.getUTCFullYear(),
    memberSinceDate.getUTCMonth(),
    memberSinceDate.getUTCDate()
  ));
  
  const now = new Date();
  const nowUTC = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));
  
  const diffInMs = nowUTC.getTime() - memberSinceUTC.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffInDays); // Assicura che non sia negativo
}

