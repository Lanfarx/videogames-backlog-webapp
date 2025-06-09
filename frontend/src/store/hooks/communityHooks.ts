import { useState, useEffect, useCallback } from 'react';
import { CommunityService } from '../services/communityService';
import { 
  CommunityStatsDto, 
  CommunityReviewDto, 
  PaginatedReviewsDto, 
  ReviewStatsDto,
  CommunityRatingsResponse,
  CommunityRatingsWithCountResponse,
  CreateReviewRequest,
  ReviewCommentDto,
  CreateReviewCommentDto
} from '../../types/community';
import { ActivityComment, CreateActivityCommentDto } from '../../types/activity';

// ============ TYPES FOR HOOK RESULTS ============
interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

// ============ COMMUNITY STATS HOOKS ============

/**
 * Hook per ottenere le statistiche della community per un gioco
 */
export const useCommunityStats = (gameTitle: string): ApiState<CommunityStatsDto> => {
  const [state, setState] = useState<ApiState<CommunityStatsDto>>({
    data: null,
    isLoading: false,
    error: null
  });

  useEffect(() => {
    if (!gameTitle) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    CommunityService.getCommunityStats(gameTitle)
      .then(data => setState({ data, isLoading: false, error: null }))
      .catch(error => setState({ data: null, isLoading: false, error: error.message }));
  }, [gameTitle]);

  return state;
};

/**
 * Hook per ottenere il rating di un gioco
 */
export const useCommunityRating = (gameTitle: string): ApiState<number> => {
  const [state, setState] = useState<ApiState<number>>({
    data: null,
    isLoading: false,
    error: null
  });

  useEffect(() => {
    if (!gameTitle) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    CommunityService.getCommunityRating(gameTitle)
      .then(data => setState({ data, isLoading: false, error: null }))
      .catch(error => setState({ data: null, isLoading: false, error: error.message }));
  }, [gameTitle]);

  return state;
};

/**
 * Hook per ottenere i rating di più giochi
 */
export const useCommunityRatings = (gameTitles: string[]): ApiState<CommunityRatingsResponse> => {
  const [state, setState] = useState<ApiState<CommunityRatingsResponse>>({
    data: null,
    isLoading: false,
    error: null
  });

  useEffect(() => {
    if (gameTitles.length === 0) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    CommunityService.getCommunityRatings(gameTitles)
      .then(data => setState({ data, isLoading: false, error: null }))
      .catch(error => setState({ data: null, isLoading: false, error: error.message }));
  }, [gameTitles.join(',')]);

  return state;
};

/**
 * Hook per ottenere i rating con numero di recensioni di più giochi
 */
export const useCommunityRatingsWithCount = (gameTitles: string[]): ApiState<CommunityRatingsWithCountResponse> => {
  const [state, setState] = useState<ApiState<CommunityRatingsWithCountResponse>>({
    data: null,
    isLoading: false,
    error: null
  });

  useEffect(() => {
    if (gameTitles.length === 0) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    CommunityService.getCommunityRatingsWithCount(gameTitles)
      .then(data => setState({ data, isLoading: false, error: null }))
      .catch(error => setState({ data: null, isLoading: false, error: error.message }));
  }, [gameTitles.join(',')]);

  return state;
};

// ============ REVIEWS HOOKS ============

/**
 * Hook per ottenere le recensioni di un gioco con paginazione
 */
export const useCommunityReviews = (
  gameTitle: string, 
  page: number = 1, 
  pageSize: number = 10
): ApiState<PaginatedReviewsDto> => {
  const [state, setState] = useState<ApiState<PaginatedReviewsDto>>({
    data: null,
    isLoading: false,
    error: null
  });

  useEffect(() => {
    if (!gameTitle) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    CommunityService.getReviews(gameTitle, page, pageSize)
      .then(data => setState({ data, isLoading: false, error: null }))
      .catch(error => setState({ data: null, isLoading: false, error: error.message }));
  }, [gameTitle, page, pageSize]);

  return state;
};

/**
 * Hook per ottenere le statistiche dettagliate delle recensioni
 */
export const useReviewStats = (gameTitle: string): ApiState<ReviewStatsDto> => {
  const [state, setState] = useState<ApiState<ReviewStatsDto>>({
    data: null,
    isLoading: false,
    error: null
  });

  useEffect(() => {
    if (!gameTitle) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    CommunityService.getReviewStats(gameTitle)
      .then(data => setState({ data, isLoading: false, error: null }))
      .catch(error => setState({ data: null, isLoading: false, error: error.message }));
  }, [gameTitle]);

  return state;
};

// ============ PUBLIC REVIEWS HOOKS ============

export const usePublicCommunityReviews = (
  gameTitle: string, 
  page: number = 1, 
  pageSize: number = 10
): ApiState<PaginatedReviewsDto> => {
  const [state, setState] = useState<ApiState<PaginatedReviewsDto>>({
    data: null,
    isLoading: false,
    error: null
  });

  useEffect(() => {
    if (!gameTitle) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    CommunityService.getPublicReviews(gameTitle, page, pageSize)
      .then(data => setState({ data, isLoading: false, error: null }))
      .catch(error => setState({ data: null, isLoading: false, error: error.message }));
  }, [gameTitle, page, pageSize]);

  return state;
};

// ============ CONVENIENCE HOOKS ============

/**
 * Hook per ottenere sia le statistiche che le recensioni di un gioco
 */
export const useGameCommunityData = (gameTitle: string, page: number = 1, pageSize: number = 10) => {
  const statsResult = useCommunityStats(gameTitle);
  const reviewsResult = useCommunityReviews(gameTitle, page, pageSize);

  return {
    stats: statsResult.data,
    reviews: reviewsResult.data?.reviews || [],
    totalReviews: reviewsResult.data?.totalCount || 0,
    totalPages: reviewsResult.data?.totalPages || 0,
    currentPage: reviewsResult.data?.page || 1,
    isLoading: statsResult.isLoading || reviewsResult.isLoading,
    isError: !!statsResult.error || !!reviewsResult.error,
    error: statsResult.error || reviewsResult.error,
    refetch: () => {
      // Con il nuovo sistema, il refetch viene gestito automaticamente
      // quando cambiano le dipendenze degli useEffect
    }
  };
};

// ============ MUTATION HOOKS ============

/**
 * Hook per aggiungere una recensione
 */
export const useAddReview = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const mutate = useCallback(async (reviewData: CreateReviewRequest) => {
    setIsLoading(true);
    try {
      const result = await CommunityService.addReview(reviewData);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    mutate,
    isLoading
  };
};

// ============ REVIEW COMMENTS HOOKS ============

/**
 * Hook per ottenere i commenti di una recensione
 */
export const useReviewComments = (reviewGameId: number): ApiState<ReviewCommentDto[]> => {
  const [state, setState] = useState<ApiState<ReviewCommentDto[]>>({
    data: null,
    isLoading: false,
    error: null
  });

  useEffect(() => {
    if (!reviewGameId) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    CommunityService.getReviewComments(reviewGameId)
      .then(data => setState({ data, isLoading: false, error: null }))
      .catch(error => setState({ data: null, isLoading: false, error: error.message }));
  }, [reviewGameId]);

  return state;
};

/**
 * Hook per aggiungere un commento a una recensione
 */
export const useAddReviewComment = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const mutate = useCallback(async (commentData: CreateReviewCommentDto) => {
    setIsLoading(true);
    try {
      const result = await CommunityService.addReviewComment(commentData);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    mutate,
    isLoading
  };
};

/**
 * Hook per eliminare un commento
 */
export const useDeleteReviewComment = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const mutate = useCallback(async (commentId: number) => {
    setIsLoading(true);
    try {
      const result = await CommunityService.deleteReviewComment(commentId);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    mutate,
    isLoading
  };
};

// ============ ACTIVITY COMMENTS HOOKS ============

/**
 * Hook per ottenere i commenti di un'attività
 */
export const useActivityComments = (activityId: number): ApiState<ActivityComment[]> => {
  const [state, setState] = useState<ApiState<ActivityComment[]>>({
    data: null,
    isLoading: false,
    error: null
  });

  useEffect(() => {
    if (activityId <= 0) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    CommunityService.getActivityComments(activityId)
      .then(data => setState({ data, isLoading: false, error: null }))
      .catch(error => setState({ data: null, isLoading: false, error: error.message }));
  }, [activityId]);

  return state;
};

/**
 * Hook per aggiungere un commento a un'attività
 */
export const useAddActivityComment = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const mutate = useCallback(async (commentData: CreateActivityCommentDto) => {
    setIsLoading(true);
    try {
      const result = await CommunityService.addActivityComment(commentData);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    mutate,
    isLoading
  };
};

/**
 * Hook per eliminare un commento a un'attività
 */
export const useDeleteActivityComment = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const mutate = useCallback(async (commentId: number) => {
    setIsLoading(true);
    try {
      const result = await CommunityService.deleteActivityComment(commentId);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    mutate,
    isLoading
  };
};

// ============ ALIAS PER COMPATIBILITÀ ============

/**
 * Alias per mantenere compatibilità con i componenti che usano nomi precedenti
 */
export const usePublicCommunityStats = useCommunityStats;
export const usePublicCommunityRatingsWithCount = useCommunityRatingsWithCount;

/**
 * Hook di compatibilità per sostituire useCommunityStatsByGame
 */
export const useCommunityStatsByGame = (gameTitle: string) => {
  const { data, isLoading, error } = useCommunityStats(gameTitle);
  
  return {
    data: data || {
      totalPlayers: 0,
      averageRating: 0,
      totalReviews: 0,
      averagePlaytime: 0,
      completionRate: 0,
      currentlyPlaying: 0
    },
    isLoading,
    error
  };
};

/**
 * Hook di compatibilità per sostituire useCommunityReviewsByGame
 */
export const useCommunityReviewsByGame = (gameTitle: string) => {
  const { data, isLoading, error } = useCommunityReviews(gameTitle, 1, 50); // Prime 50 recensioni
  
  return {
    data: data?.reviews || [],
    isLoading,
    error
  };
};
