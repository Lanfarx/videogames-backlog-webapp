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
import { calculateCommunityRating } from '../../utils/gamesUtils';
import { useAllGamesTitleWithRating } from './gamesHooks';

// Hook per ottenere tutte le recensioni
export const useAllCommunityReviews = () => {
  return useSelector((state: RootState) => state.community.Reviews);
};

// Hook per ottenere le recensioni di un gioco specifico
export const useCommunityReviewsByGame = (gameTitle: string) => {
  return useSelector((state: RootState) => 
    state.community.Reviews.filter(Review => Review.gameTitle === gameTitle)
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
    addReview: (Review: Omit<CommunityReview, 'id'>) => {
      const newReview = {
        ...Review,
        id: Date.now() + Math.random() // Genera un ID temporaneo
      };
      dispatch(addReview(newReview));
    },
    
    removeReview: (ReviewId: number) => {
      dispatch(removeReview(ReviewId));
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
  const Reviews: CommunityReview[] = useSelector((state: RootState) =>
    state.community.Reviews.filter(r => r.gameTitle === gameTitle)
  );
  // Prendi tutti i giochi utente con quel titolo
  const userGames: Game[] = useSelector((state: RootState) =>
    state.games.games.filter(g => g.Title === gameTitle)
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
  const totalReviews = Reviews.length;
  const averageRating = totalReviews > 0 ? (Reviews.reduce((sum, r) => sum + r.Rating, 0) / totalReviews) : 0;
  const averagePlaytime = userGames.reduce((sum, g) => sum + (g.HoursPlayed || 0), 0) / userGames.length;
  const Completed = userGames.filter(g => g.Status === 'Completed' || g.Status === 'Platinum').length;
  const completionRate = Math.round((Completed / userGames.length) * 100);
  const currentlyPlaying = userGames.filter(g => g.Status === 'InProgress').length;

  return {
    totalPlayers,
    averageRating,
    totalReviews,
    averagePlaytime: Math.round(averagePlaytime),
    completionRate,
    currentlyPlaying
  };
}

// Hook custom per ottenere il community Rating medio dato un titolo di gioco
export function useCommunityCommunityRating(gameTitle: string): number {
  // Prendi tutti i giochi utente con quel titolo e Rating valido
  const userGames = useAllGamesTitleWithRating(gameTitle);
  return calculateCommunityRating(userGames);
}

// Hook custom per ottenere tutti i community Ratings per una lista di giochi
export function useAllCommunityRatings(gameTitles: string[]): Record<string, number> {
  const userGames = useSelector((state: RootState) => state.games.games);
  
  return gameTitles.reduce((Ratings, title) => {
    const titleGames = userGames.filter(g => g.Title === title && g.Rating !== undefined);
    Ratings[title] = calculateCommunityRating(titleGames);
    return Ratings;
  }, {} as Record<string, number>);
}

// Hook per ottenere il numero di recensioni valide della community per un gioco
// RIMOSSO: useCommunityReviewsCount perché ora il conteggio si fa direttamente nei componenti tramite useCommunityReviewsByGame
