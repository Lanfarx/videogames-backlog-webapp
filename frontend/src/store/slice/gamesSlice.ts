import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Game, GameReview, GameComment } from '../../types/game';
import {
  fetchGames,
  addGame,
  updateGameThunk,
  deleteGameThunk,
  fetchComments,
  addCommentThunk,
  deleteCommentThunk
} from '../thunks/gamesThunks';

interface GamesState {
  games: Game[];
  loading: boolean;
  error: string | null;
}

const initialState: GamesState = {
  games: [],
  loading: false,
  error: null,
};

const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    setGames(state, action: PayloadAction<Game[]>) {
      state.games = action.payload;
    },
    updateGame(state, action: PayloadAction<Game>) {
      const idx = state.games.findIndex(g => g.id === action.payload.id);
      if (idx !== -1) {
        state.games[idx] = action.payload;
      }
    },
    updateGameRating(state, action: PayloadAction<{ gameId: number; Rating: number }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game) {
        game.Rating = action.payload.Rating;
      }
    },
    updateGameReview(state, action: PayloadAction<{ gameId: number; Review: GameReview }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game) {
        game.Review = action.payload.Review;
      }
    },
    updateReviewPrivacy(state, action: PayloadAction<{ gameId: number; IsPublic: boolean }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game && game.Review) {
        game.Review.IsPublic = action.payload.IsPublic;
      }
    },
    updateGameStatus(state, action: PayloadAction<{ gameId: number; Status: Game["Status"] }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game) {
        const previousStatus = game.Status;
        const newStatus = action.payload.Status;
        const today = new Date().toISOString().split('T')[0];
        
        // Aggiorna lo stato
        game.Status = newStatus;
        
        // Gestisci automaticamente le date in base al nuovo stato
        if (newStatus === 'Completed') {
          // Quando diventa completato: imposta CompletionDate
          game.CompletionDate = today;
          // Se aveva PlatinumDate, rimuovilo (non è più platino)
          game.PlatinumDate = undefined;
        } else if (newStatus === 'Platinum') {
          // Quando diventa platino: imposta PlatinumDate e mantieni/imposta CompletionDate
          game.PlatinumDate = today;
          // Se non ha già una data di completamento, impostala
          if (!game.CompletionDate) {
            game.CompletionDate = today;
          }
        } else {
          // Per tutti gli altri stati, rimuovi entrambe le date
          if (previousStatus === 'Completed' || previousStatus === 'Platinum') {
            game.CompletionDate = undefined;
            game.PlatinumDate = undefined;
          }
        }
      }
    },
    updateGameplaytime(state, action: PayloadAction<{ gameId: number; HoursPlayed: number }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game) {
        game.HoursPlayed = action.payload.HoursPlayed;
        
        // Se il gioco era "Da iniziare" e ora ha ore di gioco, imposta lo stato a "In corso"
        if (game.Status === 'NotStarted' && action.payload.HoursPlayed > 0) {
          game.Status = 'InProgress';
        }
      }
    },
    updateGameNotes(state, action: PayloadAction<{ gameId: number; Notes: string }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game) {
        game.Notes = action.payload.Notes;
      }
    },
    updateGameCompletionDate(state, action: PayloadAction<{ gameId: number; CompletionDate: string }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game) {
        game.CompletionDate = action.payload.CompletionDate;
      }
    },
    updateGamePlatinumDate(state, action: PayloadAction<{ gameId: number; PlatinumDate: string }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game) {
        game.PlatinumDate = action.payload.PlatinumDate;
      }
    },
    updateGamePlatform(state, action: PayloadAction<{ gameId: number; Platform: string }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game) {
        game.Platform = action.payload.Platform;
      }
    },
    updateGamePrice(state, action: PayloadAction<{ gameId: number; Price: number }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game) {
        game.Price = action.payload.Price;
      }
    },
    updateGamePurchaseDate(state, action: PayloadAction<{ gameId: number; PurchaseDate: string }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game) {
        game.PurchaseDate = action.payload.PurchaseDate;
      }
    },
    updateGameMetacritic(state, action: PayloadAction<{ gameId: number; Metacritic: number }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game) {
        game.Metacritic = action.payload.Metacritic;
      }
    },
    updateGameComments(state, action: PayloadAction<{ gameId: number; Comments: GameComment[] }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game) {
        game.Comments = action.payload.Comments;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.games = action.payload;
        state.loading = false;
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Errore caricamento giochi';
      })
      .addCase(addGame.fulfilled, (state, action) => {
        state.games.push(action.payload);
      })
      .addCase(updateGameThunk.fulfilled, (state, action) => {
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
      })
      .addCase(deleteCommentThunk.fulfilled, (state, action) => {
        const game = state.games.find(g => g.id === action.payload.gameId);
        if (game && game.Comments) {
          game.Comments = game.Comments.filter(c => c.Id !== action.payload.commentId);
        }
      });
  }
});

export const { 
  setGames, 
  updateGame, 
  updateGameRating, 
  updateGameReview, 
  updateGameStatus, 
  updateGameplaytime, 
  updateGameNotes, 
  updateGameCompletionDate, 
  updateGamePlatinumDate, 
  updateGamePlatform, 
  updateGamePrice, 
  updateGamePurchaseDate, 
  updateGameMetacritic,
  updateGameComments,
  updateReviewPrivacy 
} = gamesSlice.actions;

export default gamesSlice.reducer;
