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
  fetchComments,
  addCommentThunk,
  deleteCommentThunk,
  updateCommentThunk,
  fetchGameStats
} from '../thunks/gamesThunks';

interface GamesState {
  games: Game[];
  loading: boolean;
  error: string | null;
  gamesLoaded: boolean;
  loadedGameTitles: string[];
  // Aggiungiamo il tracking dei commenti caricati
  loadedCommentGameIds: number[];
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
  loadedCommentGameIds: [],
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
      state.gamesLoaded = false;
      state.stats = null;
      state.statsLoading = false;
      state.statsError = null;
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
      // Fetch singolo gioco per ID
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
      })
      .addCase(addGame.fulfilled, (state, action) => {
        state.games.push(action.payload);
      })      
      .addCase(updateGameThunk.fulfilled, (state, action) => {
        const idx = state.games.findIndex(g => g.id === action.payload.id);
        if (idx !== -1) state.games[idx] = action.payload;
      })      
      .addCase(updateGameStatusThunk.fulfilled, (state, action) => {
        const idx = state.games.findIndex(g => g.id === action.payload.id);
        if (idx !== -1) state.games[idx] = action.payload;
      })
      .addCase(updateGamePlaytimeThunk.fulfilled, (state, action) => {
        const idx = state.games.findIndex(g => g.id === action.payload.id);
        if (idx !== -1) state.games[idx] = action.payload;
      })
      .addCase(deleteGameThunk.fulfilled, (state, action) => {
        state.games = state.games.filter(g => g.id !== action.payload);
      })
      // Commenti
      .addCase(fetchComments.fulfilled, (state, action) => {
        const game = state.games.find(g => g.id === action.payload.gameId);
        if (game) game.Comments = action.payload.Comments;
      })
      .addCase(addCommentThunk.fulfilled, (state, action) => {
        const game = state.games.find(g => g.id === action.payload.gameId);
        if (game) {
          if (!game.Comments) game.Comments = [];
          game.Comments.push(action.payload.comment);
        }
      })      .addCase(deleteCommentThunk.fulfilled, (state, action) => {
        const game = state.games.find(g => g.id === action.payload.gameId);
        if (game && game.Comments) {
          game.Comments = game.Comments.filter(c => c.Id !== action.payload.commentId);
        }
      })
      .addCase(updateCommentThunk.fulfilled, (state, action) => {
        const game = state.games.find(g => g.id === action.payload.gameId);
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

export const { resetGamesState } = gamesSlice.actions;
export default gamesSlice.reducer;
