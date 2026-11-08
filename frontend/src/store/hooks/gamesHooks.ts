import { useSelector } from 'react-redux';
import { RootState } from '..';
import { Game, GameStatus, GamePlatform, GameUpdateInput, PublicCatalogGame, GameComment } from '../../types/game';
import { GAME_PlatformS, Status_LABELS, Status_COLORS } from '../../constants/gameConstants';
import {
  fetchGames,
  fetchGameById,
  fetchGameByTitle,
  addGame,
  updateGameThunk,
  updateGameStatusThunk,
  updateGamePlaytimeThunk,
  deleteGameThunk,
  deleteAllGamesThunk,
  fetchComments,
  addCommentThunk,
  deleteCommentThunk,
  updateCommentThunk,
  bulkUpdateStatusThunk,
  bulkDeleteThunk
} from '../thunks/gamesThunks';
import { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { calculateGameStats } from '../../utils/gamesUtils';
import { useAppDispatch } from '../hooks';
import type { GameStats } from '../../types/stats';

export function useLoadGames() {
  const dispatch = useAppDispatch();
  const loading = useSelector((state: RootState) => state.games.loading);
  const error = useSelector((state: RootState) => state.games.error);
  const gamesLoaded = useSelector((state: RootState) => state.games.gamesLoaded);
  
  useEffect(() => {
    // Fetch dei giochi solo se non sono mai stati caricati e non è in loading
    if (!gamesLoaded && !loading) {
      dispatch(fetchGames());
    }
  }, [dispatch, gamesLoaded, loading]);
  
  return { loading, error, gamesLoaded };
}

export function useLoadSingleGameByTitle(title: string) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);
  
  // Ottieni il gioco dallo stato Redux in tempo reale
  const game = useGameByTitle(title);
  
  
  useEffect(() => {
    // Reset quando cambia il titolo
    if (title) {
      setHasAttempted(false);
      setError(null);
      setLoading(false);
    }
  }, [title]);
  
  // Effect separato per gestire il loading quando il gioco viene trovato
  useEffect(() => {
    if (game && loading) {
      setLoading(false);
    }
  }, [game, loading]);
  
  useEffect(() => {
    // Se non c'è titolo, esci
    if (!title) return;
    
    // Se il gioco è già presente nello stato, non caricare
    if (game) {
      setLoading(false);
      return;
    }
    
    // Se stiamo già caricando o abbiamo già tentato, esci
    if (loading || hasAttempted) return;
    
    let isMounted = true;
    
    const loadGame = async () => {
      setLoading(true);
      setError(null);
      setHasAttempted(true);
        try {
        await dispatch(fetchGameByTitle(title)).unwrap();
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Errore nel caricamento');
          setLoading(false);
        }
      }
    };
    
    loadGame();
    
    return () => {
      isMounted = false;
    };
  }, [title, game, loading, hasAttempted, dispatch]);
  
  return { game, loading, error };
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

// Calcolate dai giochi in memoria: restano sempre allineate alla libreria senza chiamate in più
export function useGamesStats() {
  const games = useAllGames();
  const loading = useSelector((state: RootState) => state.games.loading);
  const error = useSelector((state: RootState) => state.games.error);
  const stats = useMemo(() => calculateGameStats(games), [games]);
  return { stats, loading, error };
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
export function useGameComments(GameId: number) {
  const dispatch = useAppDispatch();
  const game = useGameById(GameId);
  const Comments = game?.Comments || [];
  
  const loadComments = useCallback(() => {
    if (GameId > 0) {
      dispatch(fetchComments(GameId));
    }
  }, [dispatch, GameId]);

  useEffect(() => {
    if (GameId > 0) {
      loadComments();
    }
  }, [GameId, loadComments]);
  
  const addComment = useCallback(async (comment: GameComment) => {
    const result = await dispatch(addCommentThunk({ GameId, comment }));
    return result;
  }, [dispatch, GameId]);
  
  const deleteComment = useCallback(async (commentId: number) => {
    const result = await dispatch(deleteCommentThunk({ GameId, commentId }));
    return result;
  }, [dispatch, GameId]);
  
  const updateComment = useCallback(async (commentId: number, comment: GameComment) => {
    const result = await dispatch(updateCommentThunk({ GameId, commentId, comment }));
    return result;
  }, [dispatch, GameId]);
  
  return { Comments, loadComments, addComment, deleteComment, updateComment };
}

// Hook per operazioni CRUD giochi
export function useGameActions() {
  const dispatch = useAppDispatch();
  
  const add = useCallback(async (game: Omit<Game, 'id'>) => {
    const result = await dispatch(addGame(game));
    return result;
  }, [dispatch]);
  
  const update = useCallback(async (id: number, data: GameUpdateInput) => {
    const result = await dispatch(updateGameThunk({ id, data }));
    return result;
  }, [dispatch]);
  
  const updateStatus = useCallback(async (id: number, status: string) => {
    const result = await dispatch(updateGameStatusThunk({ id, status }));
    return result;
  }, [dispatch]);
  
  const updatePlaytime = useCallback(async (id: number, hoursPlayed: number) => {
    const result = await dispatch(updateGamePlaytimeThunk({ id, hoursPlayed }));
    return result;
  }, [dispatch]);
    const remove = useCallback(async (id: number) => {
    const result = await dispatch(deleteGameThunk(id));
    return result;
  }, [dispatch]);

  const removeAll = useCallback(async () => {
    const result = await dispatch(deleteAllGamesThunk());
    return result;
  }, [dispatch]);
  const updateStatusBulk = useCallback((ids: number[], status: string) => dispatch(bulkUpdateStatusThunk({ ids, status })), [dispatch]);

  const removeBulk = useCallback((ids: number[]) => dispatch(bulkDeleteThunk(ids)), [dispatch]);

  return { add, update, updateStatus, updatePlaytime, remove, removeAll, updateStatusBulk, removeBulk };
}

// Hook specifico per azioni di aggiornamento dello status
export function useGameStatusActions() {
  const dispatch = useAppDispatch();
  
  const updateStatus = useCallback(async (GameId: number, status: string) => {
    const result = await dispatch(updateGameStatusThunk({ id: GameId, status }));
    return result;
  }, [dispatch]);

  return { updateStatus };
}

// Hook specifico per azioni di aggiornamento del playtime
export function useGamePlaytimeActions() {
  const dispatch = useAppDispatch();
  
  const updatePlaytime = useCallback(async (GameId: number, hoursPlayed: number) => {
    const result = await dispatch(updateGamePlaytimeThunk({ id: GameId, hoursPlayed }));
    return result;
  }, [dispatch]);

  return { updatePlaytime };
}

// Nuove funzioni spostate da statusUtils

export interface StatusItem {
  Status: GameStatus | string;
  label: string;
  count: number;
  color: string;
}

/**
 * Genera i dati di stato per i grafici e le visualizzazioni
 * Usa lo stato globale tramite hook
 */
export function useStatusData(): StatusItem[] {
  const { stats } = useGamesStats();
  return Object.entries(Status_LABELS).map(([Status, label]) => ({
    Status: Status as GameStatus,
    label: label,
    count: getCountForStatus(stats, Status as GameStatus),
    color: Status_COLORS[Status as GameStatus]
  }));
}

function getCountForStatus(stats: GameStats, Status: GameStatus): number {
  switch (Status) {
    case 'InProgress': return stats.inProgress;
    case 'NotStarted': return stats.notStarted;
    case 'Completed': return stats.completed - stats.platinum; // Completed senza platinum
    case 'Abandoned': return stats.abandoned;
    case 'Platinum': return stats.platinum;
    default: return 0;
  }
}

