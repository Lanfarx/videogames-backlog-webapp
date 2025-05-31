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
  updateCommentThunk
} from '../thunks/gamesThunks';

interface GamesState {
  games: Game[];
  loading: boolean;
  error: string | null;
  gamesLoaded: boolean; // Flag per tracciare se i giochi sono stati caricati almeno una volta
  loadedGameTitles: string[]; // Flag per tracciare quali giochi per titolo sono stati caricati
}

const initialState: GamesState = {
  games: [],
  loading: false,
  error: null,
  gamesLoaded: false,
  loadedGameTitles: [],
};

const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {    resetGamesState: (state) => {
      // Reset completo dello stato quando l'utente fa logout
      state.games = [];
      state.loading = false;
      state.error = null;
      state.gamesLoaded = false;
      state.loadedGameTitles = [];
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
      })      .addCase(fetchGameById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Errore caricamento gioco';
      })
      // Fetch singolo gioco per titolo
      .addCase(fetchGameByTitle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })      .addCase(fetchGameByTitle.fulfilled, (state, action) => {
        state.loading = false;
        // Aggiunge o aggiorna il gioco nell'array
        const existingIndex = state.games.findIndex(g => g.id === action.payload.id);
        if (existingIndex !== -1) {
          state.games[existingIndex] = action.payload;
        } else {
          state.games.push(action.payload);
        }        // Aggiungi il titolo al set dei titoli caricati
        if (!state.loadedGameTitles.includes(action.payload.Title)) {
          state.loadedGameTitles.push(action.payload.Title);
        }
      })      .addCase(fetchGameByTitle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Errore caricamento gioco';
        // Anche se fallisce, aggiungiamo il titolo per evitare tentativi ripetuti
        // Potremmo voler gestire questo diversamente in futuro
        if (action.meta.arg && !state.loadedGameTitles.includes(action.meta.arg)) {
          state.loadedGameTitles.push(action.meta.arg);
        }
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
      });
  }
});

export const { resetGamesState } = gamesSlice.actions;
export default gamesSlice.reducer;
