/**
 * Utilità per la formattazione della visualizzazione dei dati dei giochi
 */

/**
 * Formatta il prezzo per la visualizzazione
 * Se il prezzo è 0, mostra "Gratis", altrimenti il prezzo con €
 */
export function formatPrice(price: number): string {
  if (price === 0) {
    return 'Gratis';
  }
  return `${price.toFixed(2)} €`;
}

/**
 * Formatta la data di acquisto per la visualizzazione
 * Se non c'è data di acquisto, mostra il testo appropriato in base alla piattaforma
 */
export function formatPurchaseDate(purchaseDate: string | null | undefined, platform?: string, locale: string = 'it-IT'): string {
  if (!purchaseDate) {
    // Determina il testo da mostrare in base alla piattaforma
    if (platform?.toLowerCase().includes('xbox')) {
      return 'Xbox Game Pass';
    } else if (platform?.toLowerCase().includes('steam')) {
      return 'Family Share';
    } else {
      return 'Rubato'; // Default
    }
  }
  
  try {
    return new Date(purchaseDate).toLocaleDateString(locale);
  } catch (error) {
    console.error('Errore nella formattazione della data:', error);
    // Fallback in caso di errore
    if (platform?.toLowerCase().includes('xbox')) {
      return 'Xbox Game Pass';
    } else {
      return 'Family Share';
    }
  }
}

/**
 * Formatta la data di acquisto per la visualizzazione con testo personalizzato
 * Include il prefisso "Acquistato il:" per le GameCard
 */
export function formatPurchaseDateWithLabel(purchaseDate: string | null | undefined, platform?: string, locale: string = 'it-IT'): string {
  if (!purchaseDate) {
    // Determina il testo da mostrare in base alla piattaforma
    if (platform?.toLowerCase().includes('xbox')) {
      return 'Xbox Game Pass';
    } else if (platform?.toLowerCase().includes('steam')) {
      return 'Family Share';
    } else {
      return 'Family Share'; // Default
    }
  }
  
  try {
    const formattedDate = new Date(purchaseDate).toLocaleDateString(locale);
    return `Acquistato il: ${formattedDate}`;
  } catch (error) {
    console.error('Errore nella formattazione della data:', error);
    // Fallback in caso di errore
    if (platform?.toLowerCase().includes('xbox')) {
      return 'Xbox Game Pass';
    } else {
      return 'Family Share';
    }
  }
}

/**
 * Formatta il punteggio Metacritic per la visualizzazione
 * Se il punteggio è 0 o null/undefined, mostra "N.D." (Non Disponibile)
 */
export function formatMetacriticScore(metacritic: number | null | undefined): string {
  if (!metacritic || metacritic === 0) {
    return 'N.D.';
  }
  return metacritic.toString();
}
