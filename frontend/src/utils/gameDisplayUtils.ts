/**
 * Utilità per la formattazione della visualizzazione dei dati dei giochi
 */

/**
 * Formatta il prezzo per la visualizzazione
 * Se il prezzo è 0, mostra "Gratis", altrimenti il prezzo con €
 */
export function formatPrice(price: number | null | undefined, platform?: string): string {
  if (price === -1) {
    return 'Regalato';
  }
  if (price === 0) {
    return 'Gratis';
  }
  if (price === null || price === undefined) {
    if (platform?.toLowerCase().includes('steam')) {
      return 'Family Share';
    } else if (platform?.toLowerCase().includes('xbox')) {
      return 'Xbox Game Pass';
    } else {
      return 'Non specificato';
    }
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
    // Se avessimo il prezzo potremmo mettere Free to play qui, ma formatPurchaseDate base non ha il prezzo
    if (platform?.toLowerCase().includes('xbox')) {
      return 'Xbox Game Pass';
    } else if (platform?.toLowerCase().includes('steam')) {
      return 'Family Share';
    } else {
      return 'Non specificato'; // Default
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
 * Include il prefisso "Acquistato il:" o "Ottenuto il:"/"Aggiunto il:" in base al prezzo e alla piattaforma
 */
export function formatPurchaseDateWithLabel(
  purchaseDate: string | null | undefined,
  platform?: string,
  price?: number | null,
  locale: string = 'it-IT'
): string {
  if (!purchaseDate) {
    // Determina il testo da mostrare in base alla piattaforma e prezzo
    if (price === 0) {
      return 'Free to play';
    } else if (platform?.toLowerCase().includes('xbox')) {
      return 'Xbox Game Pass';
    } else if (platform?.toLowerCase().includes('steam')) {
      return 'Family Share';
    } else {
      return 'Non specificato'; // Default
    }
  }

  try {
    const formattedDate = new Date(purchaseDate).toLocaleDateString(locale);

    // Determina l'etichetta corretta
    if (price === -1) {
      return `Regalato il: ${formattedDate}`;
    } else if (price === 0) {
      return formattedDate;
    } else if (price === null || price === undefined) {
      if (platform?.toLowerCase().includes('steam')) {
        return `Condiviso il: ${formattedDate}`;
      } else if (platform?.toLowerCase().includes('xbox')) {
        return `Aggiunto il: ${formattedDate}`;
      } else {
        return `Ottenuto il: ${formattedDate}`;
      }
    }
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
