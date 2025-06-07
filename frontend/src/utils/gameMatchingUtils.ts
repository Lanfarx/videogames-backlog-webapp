// Funzioni di matching titoli Steam lato frontend
import { Game } from '../types/game';

// Normalizza il titolo (numeri romani, spazi, punteggiatura, ecc.)
export function normalizeGameTitle(title: string): string {
  if (!title) return '';
  let normalized = title.trim().toLowerCase();

  // Rimuovi punteggiatura comune e sostituisci con spazio
  normalized = normalized.replace(/[:\-–—_]/g, ' ');
  // Rimuovi spazi multipli
  normalized = normalized.replace(/\s+/g, ' ');

  // Converti numeri romani in numeri arabi
  const romanToArabic: Record<string, string> = {
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
  for (const [roman, arabic] of Object.entries(romanToArabic)) {
    normalized = normalized.replace(roman, arabic);
  }
  // Rimuovi spazi multipli di nuovo dopo sostituzioni
  normalized = normalized.replace(/\s+/g, ' ');
  return normalized.trim();
}

// Rimuove suffissi tipo "Game of the Year Edition", "Remastered", ecc.
export function removeEditionSuffixes(title: string): string {
  if (!title) return '';
  const suffixes = [
    ' Special Edition',
    ' Game of the Year Edition',
    ' GOTY Edition',
    ' Deluxe Edition',
    ' Ultimate Edition',
    ' Complete Edition',
    ' Enhanced Edition',
    ' Definitive Edition',
    " Director's Cut",
    ' Remastered',
    ' HD',
    ' (2009)', ' (2010)', ' (2011)', ' (2012)', ' (2013)', ' (2014)',
    ' (2015)', ' (2016)', ' (2017)', ' (2018)', ' (2019)', ' (2020)',
    ' (2021)', ' (2022)', ' (2023)', ' (2024)'
  ];
  let result = title;
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
  // 1. Match esatto (case-insensitive)
  const exactMatch = existingGames.find(g => g.Title.toLowerCase() === steamGameName.toLowerCase());
  if (exactMatch) return exactMatch;

  // 2. Match normalizzato (senza punteggiatura, spazi, ecc.)
  const normalizedSteamName = normalizeGameTitle(steamGameName);
  const normalizedMatch = existingGames.find(g => normalizeGameTitle(g.Title) === normalizedSteamName);
  if (normalizedMatch) return normalizedMatch;

  // 3. Match senza suffissi
  const steamNameNoEdition = removeEditionSuffixes(normalizedSteamName);
  const editionMatch = existingGames.find(g => {
    const dbNameNoEdition = removeEditionSuffixes(normalizeGameTitle(g.Title));
    return dbNameNoEdition === steamNameNoEdition;
  });
  if (editionMatch) return editionMatch;

  // 4. Match ancora più aggressivo: rimuovi tutti gli spazi
  const noSpaceSteam = steamNameNoEdition.replace(/\s+/g, '');
  const aggressiveMatch = existingGames.find(g => removeEditionSuffixes(normalizeGameTitle(g.Title)).replace(/\s+/g, '') === noSpaceSteam);
  return aggressiveMatch;
}
