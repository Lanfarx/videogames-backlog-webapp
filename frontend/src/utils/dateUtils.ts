/**
 * Formatta la data in formato compatto con l'anno sotto quando necessario
 */
export function formatShortDate(date: Date, previousDate?: Date, isLastPoint: boolean = false): string {
  const day = date.getDate();
  const month = date.toLocaleString('it-IT', { month: 'short' }).substring(0, 3);
  const year = date.getFullYear();
  const currentYear = new Date().getFullYear();
  
  // Determina se mostrare l'anno
  const showYear = (previousDate && previousDate.getFullYear() !== year) || (year !== currentYear);
  
  // Ritorna la data con l'anno su due righe quando necessario
  if (showYear) {
    return `${day} ${month}\n${year}`; // Utilizza \n per forzare un'andata a capo
  }
  
  return `${day} ${month}`;
}

/**
 * Formatta la data in formato "gg/mm/yyyy"
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('it-IT');
}
