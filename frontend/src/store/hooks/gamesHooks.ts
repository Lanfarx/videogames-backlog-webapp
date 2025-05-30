import { useSelector } from 'react-redux';
import { RootState } from '..';
import { Game, GameStatus, GamePlatform, PublicCatalogGame, GameComment } from '../../types/game';
import { GAME_PlatformS } from '../../constants/gameConstants';
import {
  fetchGames,
  addGame,
  updateGameThunk,
  deleteGameThunk,
  fetchComments,
  addCommentThunk,
  deleteCommentThunk
} from '../thunks/gamesThunks';
import { useEffect, useCallback } from 'react';
import { useAppDispatch } from '../hooks';

export function useLoadGames() {
  const dispatch = useAppDispatch();
  const games = useSelector((state: RootState) => state.games.games);
  const loading = useSelector((state: RootState) => state.games.loading);
  const error = useSelector((state: RootState) => state.games.error);
  useEffect(() => {
    if (games.length === 0) {
      dispatch(fetchGames());
    }
  }, [dispatch, games.length]);
  return { loading, error };
}

export function useAllGames(): Game[] {
  return useSelector((state: RootState) => state.games.games);
}

export function useGameById(id: number): Game | undefined {
  return useSelector((state: RootState) => state.games.games.find(g => g.id === id));
}

export function useGameByTitle(title: string): Game | undefined {
  return useSelector((state: RootState) => state.games.games.find(g => g.Title === title));
}

export function useGamesByStatus(Status: GameStatus): Game[] {
  return useSelector((state: RootState) => state.games.games.filter(g => g.Status === Status));
}

export function useGamesInProgress(): Game[] {
  return useGamesByStatus('InProgress');
}

export function useCompletedGames(): Game[] {
  return useSelector((state: RootState) => state.games.games.filter(g => g.Status === 'Completed' || g.Status === 'Platinum'));
}

export function useNotStartedGames(): Game[] {
  return useGamesByStatus('NotStarted');
}

export function useAbandonedGames(): Game[] {
  return useGamesByStatus('Abandoned');
}

export function usePlatinumGames(): Game[] {
  return useGamesByStatus('Platinum');
}

export function useGamesStats() {
  const games = useAllGames();
  const total = games.length;
  const inProgress = games.filter(g => g.Status === 'InProgress').length;
  const completed = games.filter(g => g.Status === 'Completed' || g.Status === 'Platinum').length;
  const notStarted = games.filter(g => g.Status === 'NotStarted').length;
  const abandoned = games.filter(g => g.Status === 'Abandoned').length;
  const platinum = games.filter(g => g.Status === 'Platinum').length;
  const totalHours = games.reduce((acc, g) => acc + g.HoursPlayed, 0);
  return { total, inProgress, completed, notStarted, abandoned, platinum, totalHours };
}

export function useAllPlatforms(): GamePlatform[] {
  return GAME_PlatformS;
}

export function useUsedPlatforms(): string[] {
  const games = useAllGames();
  const Platforms = new Set<string>();
  games.forEach(game => { if (game.Platform) Platforms.add(game.Platform); });
  return Array.from(Platforms).sort();
}

export function useAllGamesTitleWithRating(title: string): Game[] {
  const allGames = useAllGames();
  return allGames.filter(
    (g: Game) => g.Title === title && typeof g.Rating === 'number' && g.Rating !== null && g.Rating !== undefined
  );
}

// Hook per commenti
export function useGameComments(gameId: number) {
  const dispatch = useAppDispatch();
  const game = useGameById(gameId);
  const Comments = game?.Comments || [];
  const loadComments = useCallback(() => {
    dispatch(fetchComments(gameId));
  }, [dispatch, gameId]);
  const addComment = useCallback((comment: GameComment) => {
    dispatch(addCommentThunk({ gameId, comment }));
  }, [dispatch, gameId]);
  const deleteComment = useCallback((commentId: number) => {
    dispatch(deleteCommentThunk({ gameId, commentId }));
  }, [dispatch, gameId]);
  return { Comments, loadComments, addComment, deleteComment };
}

// Hook per operazioni CRUD giochi
export function useGameActions() {
  const dispatch = useAppDispatch();
  const add = useCallback((game: Omit<Game, 'id'>) => dispatch(addGame(game)), [dispatch]);
  const update = useCallback((id: number, data: Partial<Game>) => dispatch(updateGameThunk({ id, data })), [dispatch]);
  const remove = useCallback((id: number) => dispatch(deleteGameThunk(id)), [dispatch]);
  return { add, update, remove };
}

