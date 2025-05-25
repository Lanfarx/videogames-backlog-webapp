import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Game, GameReview, GameComment } from '../../types/game';

interface GamesState {
  games: Game[];
}

const initialState: GamesState = {
  games: [],
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
    updateGameRating(state, action: PayloadAction<{ gameId: number; rating: number }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game) {
        game.rating = action.payload.rating;
      }
    },
    updateGameReview(state, action: PayloadAction<{ gameId: number; review: GameReview }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game) {
        game.review = action.payload.review;
      }
    },
    updateGameStatus(state, action: PayloadAction<{ gameId: number; status: Game["status"] }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game) {
        const previousStatus = game.status;
        const newStatus = action.payload.status;
        const today = new Date().toISOString().split('T')[0];
        
        // Aggiorna lo stato
        game.status = newStatus;
        
        // Gestisci automaticamente le date in base al nuovo stato
        if (newStatus === 'completed') {
          // Quando diventa completato: imposta completionDate
          game.completionDate = today;
          // Se aveva platinumDate, rimuovilo (non è più platino)
          game.platinumDate = undefined;
        } else if (newStatus === 'platinum') {
          // Quando diventa platino: imposta platinumDate e mantieni/imposta completionDate
          game.platinumDate = today;
          // Se non ha già una data di completamento, impostala
          if (!game.completionDate) {
            game.completionDate = today;
          }
        } else {
          // Per tutti gli altri stati, rimuovi entrambe le date
          if (previousStatus === 'completed' || previousStatus === 'platinum') {
            game.completionDate = undefined;
            game.platinumDate = undefined;
          }
        }
      }
    },
    updateGamePlaytime(state, action: PayloadAction<{ gameId: number; hoursPlayed: number }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game) {
        game.hoursPlayed = action.payload.hoursPlayed;
        
        // Se il gioco era "Da iniziare" e ora ha ore di gioco, imposta lo stato a "In corso"
        if (game.status === 'not-started' && action.payload.hoursPlayed > 0) {
          game.status = 'in-progress';
        }
      }
    },
    updateGameNotes(state, action: PayloadAction<{ gameId: number; notes: string }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game) {
        game.notes = action.payload.notes;
      }
    },
    updateGameCompletionDate(state, action: PayloadAction<{ gameId: number; completionDate: string }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game) {
        game.completionDate = action.payload.completionDate;
      }
    },
    updateGamePlatinumDate(state, action: PayloadAction<{ gameId: number; platinumDate: string }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game) {
        game.platinumDate = action.payload.platinumDate;
      }
    },
    updateGamePlatform(state, action: PayloadAction<{ gameId: number; platform: string }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game) {
        game.platform = action.payload.platform;
      }
    },
    updateGamePrice(state, action: PayloadAction<{ gameId: number; price: number }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game) {
        game.price = action.payload.price;
      }
    },
    updateGamePurchaseDate(state, action: PayloadAction<{ gameId: number; purchaseDate: string }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game) {
        game.purchaseDate = action.payload.purchaseDate;
      }
    },
    updateGameMetacritic(state, action: PayloadAction<{ gameId: number; metacritic: number }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game) {
        game.metacritic = action.payload.metacritic;
      }
    },
    updateGameComments(state, action: PayloadAction<{ gameId: number; comments: GameComment[] }>) {
      const game = state.games.find(g => g.id === action.payload.gameId);
      if (game) {
        game.comments = action.payload.comments;
      }
    },
    addGame(state, action: PayloadAction<Game>) {
      state.games.push(action.payload);
    },
    deleteGame(state, action: PayloadAction<number>) {
      state.games = state.games.filter(g => g.id !== action.payload);
    }
  }
});

export const { 
  setGames, 
  updateGame, 
  updateGameRating, 
  updateGameReview, 
  addGame, 
  deleteGame, 
  updateGameStatus, 
  updateGamePlaytime, 
  updateGameNotes, 
  updateGameCompletionDate, 
  updateGamePlatinumDate, 
  updateGamePlatform, 
  updateGamePrice, 
  updateGamePurchaseDate, 
  updateGameMetacritic,
  updateGameComments 
} = gamesSlice.actions;

export default gamesSlice.reducer;
