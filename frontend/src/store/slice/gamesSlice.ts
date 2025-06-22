import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Game, GameReview, GameComment } from '../../types/game';
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
  fetchGameStats,
  fetchGamesPaginated
} from '../thunks/gamesThunks';

interface GamesState {
  games: Game[];
  loading: boolean;
  error: string | null;
  gamesLoaded: boolean;
  loadedGameTitles: string[];
  // Aggiungiamo il tracking dei commenti caricati
  loadedCommentGameIds: number[];  // Paginazione
  paginatedGames: Game[];
  paginationData: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;  } | null;  paginationLoading: boolean;
  // Statistiche
  stats: {
    total: number;
    inProgress: number;
    completed: number;
    notStarted: number;
    abandoned: number;
    platinum: number;
    totalHours: number;
  } | null;
  statsLoading: boolean;
  statsError: string | null;
}

const initialState: GamesState = {
  games: [],
  loading: false,
  error: null,
  gamesLoaded: false,
  loadedGameTitles: [],
  loadedCommentGameIds: [],  paginatedGames: [],
  paginationData: null,  paginationLoading: false,
  stats: null,
  statsLoading: false,
  statsError: null
};

const gamesSlice = createSlice({
  name: 'games',
  initialState,  reducers: {
    resetGamesState: (state) => {
      // Reset completo dello stato quando l'utente fa logout
      state.games = [];
      state.loading = false;
      state.error = null;
      state.gamesLoaded = false;      state.stats = null;
      state.statsLoading = false;
      state.statsError = null;
    },    // Azione per invalidare le statistiche quando i giochi cambiano
    invalidateStats: (state) => {
      state.stats = null;
    },
    // Azioni per aggiornare i giochi paginati localmente
    updatePaginatedGame: (state, action: PayloadAction<Game>) => {
      const gameIndex = state.paginatedGames.findIndex(g => g.id === action.payload.id);
      if (gameIndex !== -1) {
        state.paginatedGames[gameIndex] = action.payload;
      }
    },
    removePaginatedGame: (state, action: PayloadAction<number>) => {
      state.paginatedGames = state.paginatedGames.filter(g => g.id !== action.payload);
      // Aggiorna anche i dati di paginazione
      if (state.paginationData) {
        state.paginationData.totalItems = Math.max(0, state.paginationData.totalItems - 1);
        state.paginationData.totalPages = Math.ceil(state.paginationData.totalItems / state.paginationData.pageSize);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })      .addCase(fetchGames.fulfilled, (state, action) => {
        state.games = action.payload;
        state.loading = false;
        state.gamesLoaded = true; // Imposta il flag quando i giochi sono caricati
      })      .addCase(fetchGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Errore caricamento giochi';
        state.gamesLoaded = true; // Imposta il flag anche in caso di errore per evitare richieste infinite
      })
      // Paginazione lato server
      .addCase(fetchGamesPaginated.pending, (state) => {
        state.paginationLoading = true;
        state.error = null;
      })
      .addCase(fetchGamesPaginated.fulfilled, (state, action) => {
        state.paginationLoading = false;
        state.paginatedGames = action.payload.games;
        state.paginationData = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalItems: action.payload.totalItems,
          pageSize: action.payload.pageSize,
          hasNextPage: action.payload.hasNextPage,
          hasPreviousPage: action.payload.hasPreviousPage
        };
      })
      .addCase(fetchGamesPaginated.rejected, (state, action) => {
        state.paginationLoading = false;
        state.error = action.error.message || 'Errore caricamento giochi paginati';
      })
      .addCase(fetchGameById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGameById.fulfilled, (state, action) => {
        state.loading = false;
        // Aggiunge o aggiorna il gioco nell'array
        const existingIndex = state.games.findIndex(g => g.id === action.payload.id);
        if (existingIndex !== -1) {
          state.games[existingIndex] = action.payload;
        } else {
          state.games.push(action.payload);
        }
      })      
      .addCase(fetchGameById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Errore caricamento gioco';
      })      // Fetch singolo gioco per titolo
      .addCase(fetchGameByTitle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGameByTitle.fulfilled, (state, action) => {
        state.loading = false;
        const loadedGame = action.payload;
        
        // Controlla se il gioco esiste già nella lista
        const existingIndex = state.games.findIndex(g => g.id === loadedGame.id);
        
        if (existingIndex >= 0) {
          // Aggiorna il gioco esistente
          state.games[existingIndex] = loadedGame;
        } else {
          // Aggiungi il nuovo gioco alla lista
          state.games.push(loadedGame);
        }
      })
      .addCase(fetchGameByTitle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Errore nel caricamento';
      })      .addCase(addGame.fulfilled, (state, action) => {
        state.games.push(action.payload);
        // Invalida le statistiche quando viene aggiunto un gioco
        state.stats = null;
      })        .addCase(updateGameThunk.fulfilled, (state, action) => {
        const idx = state.games.findIndex(g => g.id === action.payload.id);
        if (idx !== -1) state.games[idx] = action.payload;
        
        // Aggiorna anche i giochi paginati se il gioco è presente
        const paginatedIdx = state.paginatedGames.findIndex(g => g.id === action.payload.id);
        if (paginatedIdx !== -1) {
          state.paginatedGames[paginatedIdx] = action.payload;
        }
        
        // Invalida le statistiche quando viene aggiornato un gioco
        state.stats = null;
      })      .addCase(updateGameStatusThunk.fulfilled, (state, action) => {
        const idx = state.games.findIndex(g => g.id === action.payload.id);
        if (idx !== -1) state.games[idx] = action.payload;
        
        // Aggiorna anche i giochi paginati se il gioco è presente
        const paginatedIdx = state.paginatedGames.findIndex(g => g.id === action.payload.id);
        if (paginatedIdx !== -1) {
          state.paginatedGames[paginatedIdx] = action.payload;
        }
        
        // Invalida le statistiche quando viene cambiato lo status
        state.stats = null;
      })      .addCase(updateGamePlaytimeThunk.fulfilled, (state, action) => {
        const idx = state.games.findIndex(g => g.id === action.payload.id);
        if (idx !== -1) state.games[idx] = action.payload;
        
        // Aggiorna anche i giochi paginati se il gioco è presente
        const paginatedIdx = state.paginatedGames.findIndex(g => g.id === action.payload.id);
        if (paginatedIdx !== -1) {
          state.paginatedGames[paginatedIdx] = action.payload;
        }
        
        // Invalida le statistiche quando vengono aggiornate le ore
        state.stats = null;
      }).addCase(deleteGameThunk.fulfilled, (state, action) => {
        state.games = state.games.filter(g => g.id !== action.payload);
        // Invalida le statistiche quando viene eliminato un gioco
        state.stats = null;
      })
      .addCase(deleteAllGamesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })      .addCase(deleteAllGamesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.games = [];
        // Invalida le statistiche quando vengono eliminati tutti i giochi
        state.stats = null;
      })
      .addCase(deleteAllGamesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Errore nell\'eliminazione dei giochi';
      })
      // Commenti
      .addCase(fetchComments.fulfilled, (state, action) => {
        const game = state.games.find(g => g.id === action.payload.GameId);
        if (game) game.Comments = action.payload.Comments;
      })
      .addCase(addCommentThunk.fulfilled, (state, action) => {
        const game = state.games.find(g => g.id === action.payload.GameId);
        if (game) {
          if (!game.Comments) game.Comments = [];
          game.Comments.push(action.payload.comment);
        }
      })      .addCase(deleteCommentThunk.fulfilled, (state, action) => {
        const game = state.games.find(g => g.id === action.payload.GameId);
        if (game && game.Comments) {
          game.Comments = game.Comments.filter(c => c.Id !== action.payload.commentId);
        }
      })
      .addCase(updateCommentThunk.fulfilled, (state, action) => {
        const game = state.games.find(g => g.id === action.payload.GameId);
        if (game && game.Comments) {
          const commentIndex = game.Comments.findIndex(c => c.Id === action.payload.comment.Id);
          if (commentIndex !== -1) {
            game.Comments[commentIndex] = action.payload.comment;
          }
        }
      })
      // Statistiche
      .addCase(fetchGameStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchGameStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchGameStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.error.message || 'Errore nel caricamento delle statistiche';
      });
  }
});

export const { 
  resetGamesState, 
  invalidateStats, 
  updatePaginatedGame,
  removePaginatedGame
} = gamesSlice.actions;
export default gamesSlice.reducer;
