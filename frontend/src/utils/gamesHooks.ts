import { useAppSelector } from '../store/hooks';
import { Game, GameStatus, GamePlatform, GameReview } from '../types/game';
import { GAME_PLATFORMS } from '../constants/gameConstants';

export function useAllGames(): Game[] {
  return useAppSelector(state => state.games.games);
}

export function useGameById(id: number): Game | undefined {
  return useAppSelector(state => state.games.games.find(g => g.id === id));
}

export function useGamesByStatus(status: GameStatus): Game[] {
  return useAppSelector(state => state.games.games.filter(g => g.status === status));
}

export function useGamesInProgress(): Game[] {
  return useGamesByStatus('in-progress');
}

export function useCompletedGames(): Game[] {
  return useAppSelector(state => state.games.games.filter(g => g.status === 'completed' || g.status === 'platinum'));
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

export function useGamesByPlatform(): Record<string, Game[]> {
  const games = useAllGames();
  const gamesByPlatform: Record<string, Game[]> = {};
  games.forEach(game => {
    const platform = game.platform || 'Non specificata';
    if (!gamesByPlatform[platform]) gamesByPlatform[platform] = [];
    gamesByPlatform[platform].push(game);
  });
  return gamesByPlatform;
}

export function useGamesForPlatform(platform: string): Game[] {
  return useAllGames().filter(game => game.platform === platform);
}

export function calculateRatingFromReview(review: GameReview | undefined): number {
  if (!review) return 0;
  const { gameplay, graphics, story, sound } = review;
  const average = (gameplay + graphics + story + sound) / 4;
  return Math.round(average * 2) / 2;
}

export function getGameRating(game: Game): number {
  if (game.rating !== undefined) return game.rating;
  return game.review ? calculateRatingFromReview(game.review) : 0;
}

