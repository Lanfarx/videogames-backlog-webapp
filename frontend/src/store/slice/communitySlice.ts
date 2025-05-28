import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CommunityReview {
  id: number;
  username: string;
  avatar?: string;
  rating: number;
  text: string;
  date: string;
  platform: string;
  gameplay: number;
  graphics: number;
  story: number;
  sound: number;
  gameTitle: string; // Aggiunto per collegare la recensione al gioco
}

export interface CommunityStats {
  totalPlayers: number;
  averageRating: number;
  totalReviews: number;
  averagePlaytime: number;
  completionRate: number;
  currentlyPlaying: number;
}

interface CommunityState {
  reviews: CommunityReview[];
  stats: Record<string, CommunityStats>;
}

const initialState: CommunityState = {
  reviews: [],
  stats: {}
};

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    addReview: (state, action: PayloadAction<CommunityReview>) => {
      state.reviews.push(action.payload);
      // Aggiorna le statistiche del gioco
      const gameTitle = action.payload.gameTitle;
      if (!state.stats[gameTitle]) {
        state.stats[gameTitle] = {
          totalPlayers: 0,
          averageRating: 0,
          totalReviews: 0,
          averagePlaytime: 0,
          completionRate: 0,
          currentlyPlaying: 0
        };
      }
      
      const gameStats = state.stats[gameTitle];
      const gameReviews = state.reviews.filter(r => r.gameTitle === gameTitle);
      
      gameStats.totalReviews = gameReviews.length;
      gameStats.averageRating = gameReviews.reduce((sum, r) => sum + r.rating, 0) / gameReviews.length;
    },
    
    removeReview: (state, action: PayloadAction<number>) => {
      const reviewIndex = state.reviews.findIndex(r => r.id === action.payload);
      if (reviewIndex !== -1) {
        const review = state.reviews[reviewIndex];
        state.reviews.splice(reviewIndex, 1);
        
        // Aggiorna le statistiche del gioco
        const gameTitle = review.gameTitle;
        const gameReviews = state.reviews.filter(r => r.gameTitle === gameTitle);
        
        if (gameReviews.length > 0) {
          state.stats[gameTitle].totalReviews = gameReviews.length;
          state.stats[gameTitle].averageRating = gameReviews.reduce((sum, r) => sum + r.rating, 0) / gameReviews.length;
        } else {
          delete state.stats[gameTitle];
        }
      }
    },
    
    updateGameStats: (state, action: PayloadAction<{ gameTitle: string; stats: Partial<CommunityStats> }>) => {
      const { gameTitle, stats } = action.payload;
      if (!state.stats[gameTitle]) {
        state.stats[gameTitle] = {
          totalPlayers: 0,
          averageRating: 0,
          totalReviews: 0,
          averagePlaytime: 0,
          completionRate: 0,
          currentlyPlaying: 0
        };
      }
      state.stats[gameTitle] = { ...state.stats[gameTitle], ...stats };
    },
    
    // Azione per inizializzare con dati di esempio (solo per sviluppo)
    initializeSampleData: (state) => {
      // Inizializziamo con alcune recensioni di esempio
      state.reviews = [
        {
          id: 1,
          username: "GamerPro92",
          rating: 5,
          text: "Breath of the Wild ha ridefinito completamente quello che ci si aspetta da un gioco Zelda. La libertà di esplorazione è senza precedenti e ogni angolo del mondo nasconde qualche sorpresa.",
          date: "2024-01-15",
          platform: "Nintendo Switch",
          gameplay: 5,
          graphics: 4.5,
          story: 4.5,
          sound: 5,
          gameTitle: "The Legend of Zelda: Breath of the Wild"
        },
        {
          id: 2,
          username: "RetroFan88",
          rating: 4,
          text: "Il gioco è fantastico ma alcuni aspetti della storia potrebbero essere migliorati. L'esplorazione rimane il punto forte.",
          date: "2024-01-10",
          platform: "Nintendo Switch",
          gameplay: 4.5,
          graphics: 4,
          story: 3.5,
          sound: 4,
          gameTitle: "The Legend of Zelda: Breath of the Wild"
        }
      ];
      
      // Calcoliamo le statistiche in base alle recensioni
      const gameReviews = state.reviews.filter(r => r.gameTitle === "The Legend of Zelda: Breath of the Wild");
      const averageRating = gameReviews.reduce((sum, r) => sum + r.rating, 0) / gameReviews.length;
      
      state.stats["The Legend of Zelda: Breath of the Wild"] = {
        totalPlayers: 1250000,
        averageRating: averageRating,
        totalReviews: gameReviews.length,
        averagePlaytime: 98,
        completionRate: 67,
        currentlyPlaying: 23400
      };
    }
  }
});

export const { 
  addReview, 
  removeReview,  
  updateGameStats, 
  initializeSampleData 
} = communitySlice.actions;

export default communitySlice.reducer;
