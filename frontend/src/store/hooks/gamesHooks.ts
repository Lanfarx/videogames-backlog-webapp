import { useSelector } from 'react-redux';
import { RootState } from '..';
import { Game, GameStatus, GamePlatform, GameUpdateInput, PublicCatalogGame, GameComment } from '../../types/game';
import { GAME_PlatformS } from '../../constants/gameConstants';
import {
  fetchGames,
  fetchGameById,
  fetchGameByTitle,
  addGame,
  updateGameThunk,
  updateGameStatusThunk,
  updateGamePlaytimeThunk,
  deleteGameThunk,
  fetchComments,
  addCommentThunk,
  deleteCommentThunk,
  updateCommentThunk,
  fetchGameStats
} from '../thunks/gamesThunks';
import { useEffect, useCallback, useState, useRef } from 'react';
import { useAppDispatch } from '../hooks';

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

export function useGamesStats() {
  const dispatch = useAppDispatch();
  const stats = useSelector((state: RootState) => state.games.stats);
  const loading = useSelector((state: RootState) => state.games.statsLoading);
  const error = useSelector((state: RootState) => state.games.statsError);

  const loadStats = useCallback(() => {
    dispatch(fetchGameStats());
  }, [dispatch]);

  // Carica automaticamente le statistiche se non sono presenti
  useEffect(() => {
    if (!stats && !loading) {
      loadStats();
    }
  }, [stats, loading, loadStats]);

  return { 
    stats: stats || { total: 0, inProgress: 0, completed: 0, notStarted: 0, abandoned: 0, platinum: 0, totalHours: 0 }, 
    loading, 
    error, 
    loadStats 
  };
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
  
  const addComment = useCallback(async (comment: GameComment) => {
    const result = await dispatch(addCommentThunk({ gameId, comment }));
    return result;
  }, [dispatch, gameId]);
  
  const deleteComment = useCallback(async (commentId: number) => {
    const result = await dispatch(deleteCommentThunk({ gameId, commentId }));
    return result;
  }, [dispatch, gameId]);
  
  const updateComment = useCallback(async (commentId: number, comment: GameComment) => {
    const result = await dispatch(updateCommentThunk({ gameId, commentId, comment }));
    return result;
  }, [dispatch, gameId]);
  
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

  return { add, update, updateStatus, updatePlaytime, remove };
}

// Hook specifico per azioni di aggiornamento dello status
export function useGameStatusActions() {
  const dispatch = useAppDispatch();
  
  const updateStatus = useCallback(async (gameId: number, status: string) => {
    const result = await dispatch(updateGameStatusThunk({ id: gameId, status }));
    return result;
  }, [dispatch]);

  return { updateStatus };
}

// Hook specifico per azioni di aggiornamento del playtime
export function useGamePlaytimeActions() {
  const dispatch = useAppDispatch();
  
  const updatePlaytime = useCallback(async (gameId: number, hoursPlayed: number) => {
    const result = await dispatch(updateGamePlaytimeThunk({ id: gameId, hoursPlayed }));
    return result;
  }, [dispatch]);

  return { updatePlaytime };
}

