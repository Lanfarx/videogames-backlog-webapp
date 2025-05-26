import { useSelector } from 'react-redux';
import { RootState } from '..';
import { Game, GameStatus, GamePlatform,  } from '../../types/game';
import { GAME_PLATFORMS } from '../../constants/gameConstants';
import { Activity } from '../../types/activity';
import { useAllActivities } from './activitiesHooks';

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

// Statistiche sulle recensioni utente (ex useGameReviewsStats)
export function useGameReviewsStats(gameTitle: string) {
  const allActivities = useAllActivities();
  // Filtra tutte le attività di tipo 'rated' per questo gioco
  const reviews = allActivities.filter(
    (a: Activity) => a.type === 'rated' && a.gameTitle === gameTitle
  );
  if (reviews.length === 0) {
    return { count: 0, avg: 0, ratings: [] as number[] };
  }
  // Estrai il numero di stelle dalle additionalInfo (es: "5 stelle")
  const ratings = reviews.map(r => {
    const match = r.additionalInfo?.match(/(\d+(?:[.,]\d+)?)\s*stelle?/i);
    return match ? parseFloat(match[1].replace(',', '.')) : null;
  }).filter((n): n is number => n !== null);
  const avg = ratings.length > 0 ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : 0;
  return { count: ratings.length, avg, ratings };
}
