import { useSelector } from 'react-redux';
import { RootState } from '..';
import { Game, GameStatus, GamePlatform, PublicCatalogGame,  } from '../../types/game';
import { GAME_PLATFORMS } from '../../constants/gameConstants';
import { useMemo } from 'react';

export function useAllGames(): Game[] {
  return useSelector((state: RootState) => state.games.games);
}

export function useGameById(id: number): Game | undefined {
  return useSelector((state: RootState) => state.games.games.find(g => g.id === id));
}

export function useGameByTitle(title: string): Game | undefined {
  return useSelector((state: RootState) => state.games.games.find(g => g.title === title));
}

export function useGamesByStatus(status: GameStatus): Game[] {
  return useSelector((state: RootState) => state.games.games.filter(g => g.status === status));
}

export function useGamesInProgress(): Game[] {
  return useGamesByStatus('in-progress');
}

export function useCompletedGames(): Game[] {
  return useSelector((state: RootState) => state.games.games.filter(g => g.status === 'completed' || g.status === 'platinum'));
}

export function useNotStartedGames(): Game[] {
  return useGamesByStatus('not-started');
}

export function useAbandonedGames(): Game[] {
  return useGamesByStatus('abandoned');
}

export function usePlatinumGames(): Game[] {
  return useGamesByStatus('platinum');
}

export function useGamesStats() {
  const games = useAllGames();
  const total = games.length;
  const inProgress = games.filter(g => g.status === 'in-progress').length;
  const completed = games.filter(g => g.status === 'completed' || g.status === 'platinum').length;
  const notStarted = games.filter(g => g.status === 'not-started').length;
  const abandoned = games.filter(g => g.status === 'abandoned').length;
  const platinum = games.filter(g => g.status === 'platinum').length;
  const totalHours = games.reduce((acc, g) => acc + g.hoursPlayed, 0);
  return { total, inProgress, completed, notStarted, abandoned, platinum, totalHours };
}

export function useAllPlatforms(): GamePlatform[] {
  return GAME_PLATFORMS;
}

export function useUsedPlatforms(): string[] {
  const games = useAllGames();
  const platforms = new Set<string>();
  games.forEach(game => { if (game.platform) platforms.add(game.platform); });
  return Array.from(platforms).sort();
}

// Restituisce tutti i giochi con un certo titolo e rating valido
export function useAllGamesTitleWithRating(title: string): Game[] {
  const allGames = useAllGames();
  return allGames.filter(
    (g: Game) => g.title === title && typeof g.rating === 'number' && g.rating !== null && g.rating !== undefined
  );
}

