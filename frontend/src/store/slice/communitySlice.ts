import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CommunityReview {
  id: number;
  UserName: string;
  avatar?: string;
  Rating: number;
  text: string;
  date: string;
  Platform: string;
  Gameplay: number;
  Graphics: number;
  Story: number;
  Sound: number;
  GameTitle: string; // Aggiunto per collegare la recensione al gioco
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
  Reviews: CommunityReview[];
  stats: Record<string, CommunityStats>;
}

const initialState: CommunityState = {
  Reviews: [],
  stats: {}
};

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    addReview: (state, action: PayloadAction<CommunityReview>) => {
      state.Reviews.push(action.payload);
      // Aggiorna le statistiche del gioco
      const GameTitle = action.payload.GameTitle;
      if (!state.stats[GameTitle]) {
        state.stats[GameTitle] = {
          totalPlayers: 0,
          averageRating: 0,
          totalReviews: 0,
          averagePlaytime: 0,
          completionRate: 0,
          currentlyPlaying: 0
        };
      }
      
      const gameStats = state.stats[GameTitle];
      const gameReviews = state.Reviews.filter(r => r.GameTitle === GameTitle);
      
      gameStats.totalReviews = gameReviews.length;
      gameStats.averageRating = gameReviews.reduce((sum, r) => sum + r.Rating, 0) / gameReviews.length;
    },
    
    removeReview: (state, action: PayloadAction<number>) => {
      const ReviewIndex = state.Reviews.findIndex(r => r.id === action.payload);
      if (ReviewIndex !== -1) {
        const Review = state.Reviews[ReviewIndex];
        state.Reviews.splice(ReviewIndex, 1);
        
        // Aggiorna le statistiche del gioco
        const GameTitle = Review.GameTitle;
        const gameReviews = state.Reviews.filter(r => r.GameTitle === GameTitle);
        
        if (gameReviews.length > 0) {
          state.stats[GameTitle].totalReviews = gameReviews.length;
          state.stats[GameTitle].averageRating = gameReviews.reduce((sum, r) => sum + r.Rating, 0) / gameReviews.length;
        } else {
          delete state.stats[GameTitle];
        }
      }
    },
    
    updateGameStats: (state, action: PayloadAction<{ GameTitle: string; stats: Partial<CommunityStats> }>) => {
      const { GameTitle, stats } = action.payload;
      if (!state.stats[GameTitle]) {
        state.stats[GameTitle] = {
          totalPlayers: 0,
          averageRating: 0,
          totalReviews: 0,
          averagePlaytime: 0,
          completionRate: 0,
          currentlyPlaying: 0
        };
      }
      state.stats[GameTitle] = { ...state.stats[GameTitle], ...stats };
    },
    
    // Azione per inizializzare con dati di esempio (solo per sviluppo)
    initializeSampleData: (state) => {
      // Inizializziamo con alcune recensioni di esempio
      state.Reviews = [
        {
          id: 1,
          UserName: "GamerPro92",
          Rating: 5,
          text: "Breath of the Wild ha ridefinito completamente quello che ci si aspetta da un gioco Zelda. La libertà di esplorazione è senza precedenti e ogni angolo del mondo nasconde qualche sorpresa.",
          date: "2024-01-15",
          Platform: "Nintendo Switch",
          Gameplay: 5,
          Graphics: 4.5,
          Story: 4.5,
          Sound: 5,
          GameTitle: "The Legend of Zelda: Breath of the Wild"
        },
        {
          id: 2,
          UserName: "RetroFan88",
          Rating: 4,
          text: "Il gioco è fantastico ma alcuni aspetti della storia potrebbero essere migliorati. L'esplorazione rimane il punto forte.",
          date: "2024-01-10",
          Platform: "Nintendo Switch",
          Gameplay: 4.5,
          Graphics: 4,
          Story: 3.5,
          Sound: 4,
          GameTitle: "The Legend of Zelda: Breath of the Wild"
        }
      ];
      
      // Calcoliamo le statistiche in base alle recensioni
      const gameReviews = state.Reviews.filter(r => r.GameTitle === "The Legend of Zelda: Breath of the Wild");
      const averageRating = gameReviews.reduce((sum, r) => sum + r.Rating, 0) / gameReviews.length;
      
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
