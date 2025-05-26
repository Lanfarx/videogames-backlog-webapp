import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../index';
import { 
  addReview, 
  removeReview,  
  updateGameStats,
  initializeSampleData,
  CommunityReview,
  CommunityStats
} from '../slice/communitySlice';
import { Game } from '../../types/game';

// Hook per ottenere tutte le recensioni
export const useAllCommunityReviews = () => {
  return useSelector((state: RootState) => state.community.reviews);
};

// Hook per ottenere le recensioni di un gioco specifico
export const useCommunityReviewsByGame = (gameTitle: string) => {
  return useSelector((state: RootState) => 
    state.community.reviews.filter(review => review.gameTitle === gameTitle)
  );
};

// Hook per ottenere le statistiche di un gioco
export const useCommunityStatsByGame = (gameTitle: string) => {
  return useSelector((state: RootState) => state.community.stats[gameTitle]);
};

// Hook per ottenere tutte le statistiche
export const useAllCommunityStats = () => {
  return useSelector((state: RootState) => state.community.stats);
};

// Hook per le azioni della community
export const useCommunityActions = () => {
  const dispatch = useDispatch();

  return {
    addReview: (review: Omit<CommunityReview, 'id'>) => {
      const newReview = {
        ...review,
        id: Date.now() + Math.random() // Genera un ID temporaneo
      };
      dispatch(addReview(newReview));
    },
    
    removeReview: (reviewId: number) => {
      dispatch(removeReview(reviewId));
    },
    
    updateGameStats: (gameTitle: string, stats: Partial<CommunityStats>) => {
      dispatch(updateGameStats({ gameTitle, stats }));
    },
    
    initializeSampleData: () => {
      dispatch(initializeSampleData());
    }
  };
};

// Statistiche community aggregate (ex useCommunityStatsByGameAggregated)
export function useCommunityStatsByGameAggregated(gameTitle: string): CommunityStats {
  const reviews: CommunityReview[] = useSelector((state: RootState) =>
    state.community.reviews.filter(r => r.gameTitle === gameTitle)
  );
  // Prendi tutti i giochi utente con quel titolo
  const userGames: Game[] = useSelector((state: RootState) =>
    state.games.games.filter(g => g.title === gameTitle)
  );

  if (userGames.length === 0) {
    return {
      totalPlayers: 0,
      averageRating: 0,
      totalReviews: 0,
      averagePlaytime: 0,
      completionRate: 0,
      currentlyPlaying: 0
    };
  }

  // Calcolo aggregato
  const totalPlayers = userGames.length;
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) : 0;
  const averagePlaytime = userGames.reduce((sum, g) => sum + (g.hoursPlayed || 0), 0) / userGames.length;
  const completed = userGames.filter(g => g.status === 'completed' || g.status === 'platinum').length;
  const completionRate = Math.round((completed / userGames.length) * 100);
  const currentlyPlaying = userGames.filter(g => g.status === 'in-progress').length;

  return {
    totalPlayers,
    averageRating,
    totalReviews,
    averagePlaytime: Math.round(averagePlaytime),
    completionRate,
    currentlyPlaying
  };
}
