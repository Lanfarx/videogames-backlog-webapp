import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Game } from '../../types/game';
import { getGamesPaginated } from '../services/gamesService';

interface UseGameNavigationProps {
  currentGame: Game;
  filters?: any;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
}

interface GameNavigationState {
  canGoToPrevious: boolean;
  canGoToNext: boolean;
  currentIndex: number;
  totalGames: number;
  previousGame: Game | null;
  nextGame: Game | null;
}

export function useGameNavigation({
  currentGame,
  filters,
  sortBy = 'title',
  sortOrder = 'asc',
  search
}: UseGameNavigationProps) {
  const navigate = useNavigate();
  
  const [navigationState, setNavigationState] = useState<GameNavigationState>({
    canGoToPrevious: false,
    canGoToNext: false,
    currentIndex: -1,
    totalGames: 0,
    previousGame: null,
    nextGame: null
  });

  const [allGames, setAllGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gameNotFoundAttempts, setGameNotFoundAttempts] = useState(0);
  
  // Ref per evitare chiamate multiple con gli stessi parametri
  const lastParamsRef = useRef<string>('');
  const lastResultRef = useRef<Game[]>([]);

  // Carica tutti i giochi con i filtri/ordinamento applicati per avere la lista completa
  const loadAllGames = useCallback(async () => {
    if (!currentGame) return;

    // Crea una stringa per identificare i parametri correnti
    const currentParams = JSON.stringify({ 
      gameId: currentGame.id,
      filters, 
      sortBy, 
      sortOrder, 
      search 
    });
    
    // Evita di fare la stessa chiamata più volte
    if (currentParams === lastParamsRef.current && lastResultRef.current.length > 0) {
      return;
    }

    // Previeni loop infiniti se il gioco non è mai trovato
    if (gameNotFoundAttempts >= 2) {
      console.warn('Hook useGameNavigation: Gioco non trovato dopo 2 tentativi, interruzione caricamento');
      return;
    }

    setIsLoading(true);
    
    try {
      // Prima otteniamo il totale dei giochi per sapere quanti ce ne sono
      const initialResult = await getGamesPaginated(
        1,
        1, // pageSize 1 solo per ottenere il totale
        filters ? JSON.stringify(filters) : undefined,
        sortBy,
        sortOrder,
        search
      );

      if (initialResult.totalItems > 0) {
        // Poi carichiamo TUTTI i giochi in una sola chiamata
        const allGamesResult = await getGamesPaginated(
          1,
          initialResult.totalItems, // Carica tutti i giochi
          filters ? JSON.stringify(filters) : undefined,
          sortBy,
          sortOrder,
          search
        );
        
        const gamesArray = allGamesResult.games || [];
        setAllGames(gamesArray);
        lastParamsRef.current = currentParams;
        lastResultRef.current = gamesArray;

        // Se il gioco corrente non è trovato, incrementa il contatore
        const foundGame = gamesArray.find(game => game.id === currentGame.id);
        if (!foundGame) {
          setGameNotFoundAttempts(prev => prev + 1);
        } else {
          setGameNotFoundAttempts(0); // Reset del contatore se il gioco è trovato
        }
      } else {
        setAllGames([]);
        lastResultRef.current = [];
      }
    } catch (error) {
      console.error('Errore nel caricamento dei giochi per la navigazione:', error);
      setAllGames([]);
      lastResultRef.current = [];
    } finally {
      setIsLoading(false);
    }
  }, [currentGame?.id, filters, sortBy, sortOrder, search, gameNotFoundAttempts]);

  // Calcola lo stato di navigazione quando cambiano i giochi o il gioco corrente
  useEffect(() => {
    if (!currentGame || allGames.length === 0) {
      setNavigationState({
        canGoToPrevious: false,
        canGoToNext: false,
        currentIndex: -1,
        totalGames: 0,
        previousGame: null,
        nextGame: null
      });
      return;
    }

    const currentIndex = allGames.findIndex(game => game.id === currentGame.id);
    
    if (currentIndex === -1) {
      // Gioco non trovato - non ricaricare immediatamente per evitare loop
      // Il loadAllGames verrà chiamato dal prossimo useEffect se necessario
      console.warn(`Gioco "${currentGame.Title}" non trovato nella lista filtrata`);
      setNavigationState({
        canGoToPrevious: false,
        canGoToNext: false,
        currentIndex: -1,
        totalGames: allGames.length,
        previousGame: null,
        nextGame: null
      });
      return;
    }

    const previousGame = currentIndex > 0 ? allGames[currentIndex - 1] : null;
    const nextGame = currentIndex < allGames.length - 1 ? allGames[currentIndex + 1] : null;

    setNavigationState({
      canGoToPrevious: currentIndex > 0,
      canGoToNext: currentIndex < allGames.length - 1,
      currentIndex,
      totalGames: allGames.length,
      previousGame,
      nextGame
    });
  }, [currentGame?.id, allGames]);

  // Carica i giochi quando cambiano i parametri di filtro/ordinamento
  useEffect(() => {
    if (currentGame) {
      loadAllGames();
    }
  }, [currentGame?.id, filters, sortBy, sortOrder, search]); // Rimuoviamo loadAllGames dalle dipendenze

  // Funzioni di navigazione con passaggio dei parametri di navigazione
  const goToPrevious = useCallback(() => {
    if (navigationState.previousGame) {
      const encodedTitle = encodeURIComponent(navigationState.previousGame.Title.replace(/\s/g, '_'));
      navigate(`/library/${encodedTitle}`, {
        state: {
          navigationParams: {
            filters,
            sortBy,
            sortOrder,
            search
          }
        }
      });
    }
  }, [navigationState.previousGame, navigate, filters, sortBy, sortOrder, search]);

  const goToNext = useCallback(() => {
    if (navigationState.nextGame) {
      const encodedTitle = encodeURIComponent(navigationState.nextGame.Title.replace(/\s/g, '_'));
      navigate(`/library/${encodedTitle}`, {
        state: {
          navigationParams: {
            filters,
            sortBy,
            sortOrder,
            search
          }
        }
      });
    }
  }, [navigationState.nextGame, navigate, filters, sortBy, sortOrder, search]);

  return {
    ...navigationState,
    goToPrevious,
    goToNext,
    isLoading
  };
}
