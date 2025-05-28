import { Game } from '../types/game';

// Utility per generare id incrementali e persistenti per i giochi

const STORAGE_KEY = 'videogame_backlog_next_game_id';

export function getNextGameIdFromList(games: Game[]): number {
  if (!Array.isArray(games) || games.length === 0) return 1;
  const maxId = Math.max(...games.map(g => g.id || 0));
  return maxId + 1;
}

export function getNextGameId(): number {
  let nextId = 1;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      nextId = parseInt(stored, 10);
      if (isNaN(nextId) || nextId < 1) nextId = 1;
    }
  } catch {
    // fallback: nextId resta 1
  }
  localStorage.setItem(STORAGE_KEY, String(nextId + 1));
  return nextId;
}

export function setNextGameId(nextId: number) {
  localStorage.setItem(STORAGE_KEY, String(nextId));
}

// Per test/reset manuale (non usato in produzione)
export function resetGameIdCounter() {
  localStorage.setItem(STORAGE_KEY, '1');
}
