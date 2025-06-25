// Funzioni di matching titoli Steam lato frontend
import { Game } from '../types/game';

// Normalizza il titolo (numeri romani, spazi, punteggiatura, ecc.)
export function normalizeGameTitle(title: string): string {
  if (!title) return '';
  let normalized = title.trim().toLowerCase();
  // Rimuovi punteggiatura comune e sostituisci con spazio
  normalized = normalized.replace(/[:\-–—_\.]/g, ' ');
  
  // Rimuovi simboli di trademark, copyright e registered
  normalized = normalized.replace(/[™®©]/g, '');
  
  // Converti numeri romani in numeri arabi (con spazi intorno)
  const romanToArabic: Record<string, string> = {
    ' iii ': ' 3 ',
    ' ii ': ' 2 ',
    ' iv ': ' 4 ',
    ' v ': ' 5 ',
    ' vi ': ' 6 ',
    ' vii ': ' 7 ',
    ' viii ': ' 8 ',
    ' ix ': ' 9 ',
    ' x ': ' 10 ',
    // Anche senza spazi alla fine (per gestire fine titolo)
    ' iii': ' 3',
    ' ii': ' 2',
    ' iv': ' 4',
    ' v': ' 5',
    ' vi': ' 6',
    ' vii': ' 7',
    ' viii': ' 8',
    ' ix': ' 9',
    ' x': ' 10',
  };
  
  // Aggiungi spazi all'inizio e fine per facilitare il matching
  normalized = ' ' + normalized + ' ';
  
  for (const [roman, arabic] of Object.entries(romanToArabic)) {
    normalized = normalized.replace(roman, arabic);
  }
  
  // Rimuovi spazi multipli e trim
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

// Rimuove suffissi tipo "Game of the Year Edition", "Remastered", ecc.
export function removeEditionSuffixes(title: string): string {
  if (!title) return '';
  
  const suffixes = [
    ' special edition',
    ' legendary edition',
    ' anniversary edition',
    ' game of the year edition',
    ' goty edition',
    ' deluxe edition',
    ' ultimate edition',
    ' complete edition',
    ' enhanced edition',
    ' definitive edition',
    ' collectors edition',
    ' platinum edition',
    ' premium edition',
    ' gold edition',
    " director's cut",
    ' remastered',
    ' remake',
    ' hd remaster',
    ' hd',
    ' redux',
    ' (2009)', ' (2010)', ' (2011)', ' (2012)', ' (2013)', ' (2014)',
    ' (2015)', ' (2016)', ' (2017)', ' (2018)', ' (2019)', ' (2020)',
    ' (2021)', ' (2022)', ' (2023)', ' (2024)', ' (2025)'
  ];
  
  let result = title.toLowerCase(); // Converte in minuscolo per il matching
  for (const suffix of suffixes) {
    if (result.endsWith(suffix)) {
      result = result.slice(0, -suffix.length).trim();
      break;
    }
  }
  return result;
}

// Trova il gioco corrispondente nel catalogo
export function findMatchingGame(existingGames: Game[] | any[], gameNameToFind: string): Game | any | undefined {
  if (!gameNameToFind || existingGames.length === 0) return undefined;

  // Funzione helper per ottenere il titolo dell'oggetto (supporta sia Game.Title che WishlistItem.title)
  const getTitle = (item: any): string => {
    return item.Title || item.title || '';
  };

  // 1. Match esatto (case-insensitive)
  const exactMatch = existingGames.find(g => getTitle(g).toLowerCase() === gameNameToFind.toLowerCase());
  if (exactMatch) return exactMatch;

  // 2. Match normalizzato (senza punteggiatura, numeri romani convertiti)
  const normalizedGameName = normalizeGameTitle(gameNameToFind);
  const normalizedMatch = existingGames.find(g => normalizeGameTitle(getTitle(g)) === normalizedGameName);
  if (normalizedMatch) return normalizedMatch;

  // 3. Match senza suffissi di edizione (più importante per Skyrim vs Skyrim Special Edition)
  const gameNameNoEdition = removeEditionSuffixes(normalizedGameName);
  const editionMatch = existingGames.find(g => {
    const dbNameNoEdition = removeEditionSuffixes(normalizeGameTitle(getTitle(g)));
    return dbNameNoEdition === gameNameNoEdition && gameNameNoEdition.length > 3; // Evita match troppo corti
  });
  if (editionMatch) return editionMatch;

  // 4. Match ancora più aggressivo: rimuovi tutti gli spazi
  const noSpaceGame = gameNameNoEdition.replace(/\s+/g, '');
  if (noSpaceGame.length > 5) { // Evita match troppo corti senza spazi
    const aggressiveMatch = existingGames.find(g => {
      const dbNameProcessed = removeEditionSuffixes(normalizeGameTitle(getTitle(g))).replace(/\s+/g, '');
      return dbNameProcessed === noSpaceGame;
    });
    if (aggressiveMatch) return aggressiveMatch;
  }
  return undefined;
}


