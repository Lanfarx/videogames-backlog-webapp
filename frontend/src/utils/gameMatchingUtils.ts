// Funzioni di matching titoli Steam lato frontend
import { Game } from '../types/game';

// Normalizza il titolo (numeri romani, spazi, punteggiatura, ecc.)
export function normalizeGameTitle(title: string): string {
  if (!title) return '';
  let normalized = title.trim().toLowerCase();

  // Rimuovi punteggiatura comune e sostituisci con spazio
  normalized = normalized.replace(/[:\-–—_\.]/g, ' ');
  
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
export function findMatchingGame(existingGames: Game[], steamGameName: string): Game | undefined {
  if (!steamGameName || existingGames.length === 0) return undefined;

  // 1. Match esatto (case-insensitive)
  const exactMatch = existingGames.find(g => g.Title.toLowerCase() === steamGameName.toLowerCase());
  if (exactMatch) return exactMatch;

  // 2. Match normalizzato (senza punteggiatura, numeri romani convertiti)
  const normalizedSteamName = normalizeGameTitle(steamGameName);
  const normalizedMatch = existingGames.find(g => normalizeGameTitle(g.Title) === normalizedSteamName);
  if (normalizedMatch) return normalizedMatch;

  // 3. Match senza suffissi di edizione (più importante per Skyrim vs Skyrim Special Edition)
  const steamNameNoEdition = removeEditionSuffixes(normalizedSteamName);
  const editionMatch = existingGames.find(g => {
    const dbNameNoEdition = removeEditionSuffixes(normalizeGameTitle(g.Title));
    return dbNameNoEdition === steamNameNoEdition && steamNameNoEdition.length > 3; // Evita match troppo corti
  });
  if (editionMatch) return editionMatch;

  // 4. Match ancora più aggressivo: rimuovi tutti gli spazi
  const noSpaceSteam = steamNameNoEdition.replace(/\s+/g, '');
  if (noSpaceSteam.length > 5) { // Evita match troppo corti senza spazi
    const aggressiveMatch = existingGames.find(g => {
      const dbNameProcessed = removeEditionSuffixes(normalizeGameTitle(g.Title)).replace(/\s+/g, '');
      return dbNameProcessed === noSpaceSteam;
    });
    if (aggressiveMatch) return aggressiveMatch;
  }
  return undefined;
}

// Funzione di debug per testare il matching
export function debugGameMatching(title1: string, title2: string): void {
  console.log('=== Debug Game Matching ===');
  console.log('Title 1:', title1);
  console.log('Title 2:', title2);
  console.log('Normalized 1:', normalizeGameTitle(title1));
  console.log('Normalized 2:', normalizeGameTitle(title2));
  console.log('No Edition 1:', removeEditionSuffixes(normalizeGameTitle(title1)));
  console.log('No Edition 2:', removeEditionSuffixes(normalizeGameTitle(title2)));
  console.log('Should match:', removeEditionSuffixes(normalizeGameTitle(title1)) === removeEditionSuffixes(normalizeGameTitle(title2)));
  console.log('===============================');
}
