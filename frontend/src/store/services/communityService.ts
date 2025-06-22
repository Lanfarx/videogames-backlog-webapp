import axios from 'axios';
import { 
  CommunityStatsDto, 
  CommunityReviewDto, 
  PaginatedReviewsDto, 
  ReviewStatsDto,
  CommunityRatingsResponse,
  CommunityRatingsWithCountResponse,
  ReviewCommentDto,
  CreateReviewCommentDto
} from '../../types/community';
import { ActivityComment, CreateActivityCommentDto } from '../../types/activity';
import { getToken } from '../../utils/getToken';
import { API_CONFIG, buildApiUrl } from '../../config/api';

const API_BASE_URL = buildApiUrl(API_CONFIG.ENDPOINTS.COMMUNITY);

// Crea istanza axios per le notifiche
const communityApi = axios.create({
  baseURL: API_BASE_URL
});

// Istanza axios che aggiunge il token JWT se presente
communityApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export class CommunityService {
  
  /**
   * Ottiene le statistiche della community per un gioco
   */
  static async getCommunityStats(gameTitle: string): Promise<CommunityStatsDto> {
    try {
        const response = await communityApi.get<CommunityStatsDto>(
            `/stats/${encodeURIComponent(gameTitle)}`
        );
      return response.data;
    } catch (error) {
      console.error('Errore nel recupero delle statistiche:', error);
      return {
        totalPlayers: 0,
        averageRating: 0,
        totalReviews: 0,
        averagePlaytime: 0,
        completionRate: 0,
        currentlyPlaying: 0
      };
    }
  }

  /**
   * Ottiene il rating medio della community per un gioco
   */
  static async getCommunityRating(gameTitle: string): Promise<number> {
    try {
      const response = await communityApi.get<number>(
        `/rating/${encodeURIComponent(gameTitle)}`
      );
      return response.data;
    } catch (error) {
      console.error('Errore nel recupero del rating:', error);
      return 0;
    }
  }

  /**
   * Ottiene i rating della community per una lista di giochi
   */
  static async getCommunityRatings(gameTitles: string[]): Promise<CommunityRatingsResponse> {
    try {
      const response = await communityApi.post<CommunityRatingsResponse>(
        '/ratings',
        gameTitles
      );
      return response.data;
    } catch (error) {
      console.error('Errore nel recupero dei rating:', error);
      return {};
    }
  }

  /**
   * Ottiene i rating della community con numero di recensioni per una lista di giochi
   */
  static async getCommunityRatingsWithCount(gameTitles: string[]): Promise<CommunityRatingsWithCountResponse> {
    try {
      const response = await communityApi.post<CommunityRatingsWithCountResponse>(
        '/ratings-with-count',
        gameTitles
      );
      return response.data;
    } catch (error) {
      console.error('Errore nel recupero dei rating con conteggio:', error);
      return {};
    }
  }

  /**
   * Ottiene le recensioni per un gioco con paginazione
   */
  static async getReviews(
    gameTitle: string, 
    page: number = 1, 
    pageSize: number = 10
  ): Promise<PaginatedReviewsDto> {
    try {
      const response = await communityApi.get<PaginatedReviewsDto>(
        `/reviews/${encodeURIComponent(gameTitle)}`,
        {
          params: { page, pageSize }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Errore nel recupero delle recensioni:', error);
      return {
        reviews: [],
        totalCount: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      };
    }
  }
  /**
   * Ottiene le recensioni pubbliche per un gioco con paginazione (senza la recensione dell'utente corrente)
   */
  static async getPublicReviews(
    gameTitle: string, 
    page: number = 1, 
    pageSize: number = 10
  ): Promise<PaginatedReviewsDto> {
    try {
      const response = await communityApi.get<PaginatedReviewsDto>(
        `/reviews/${encodeURIComponent(gameTitle)}`,
        {
          params: { page, pageSize }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Errore nel recupero delle recensioni pubbliche:', error);
      return {
        reviews: [],
        totalCount: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      };
    }
  }

  /**
   * Ottiene le statistiche dettagliate delle recensioni per un gioco
   */
  static async getReviewStats(gameTitle: string): Promise<ReviewStatsDto> {
    try {
      const response = await communityApi.get<ReviewStatsDto>(
        `/review-stats/${encodeURIComponent(gameTitle)}`
      );
      return response.data;
    } catch (error) {
      console.error('Errore nel recupero delle statistiche recensioni:', error);
      return {
        gameTitle,
        totalReviews: 0,
        averageGameplay: 0,
        averageGraphics: 0,
        averageStory: 0,
        averageSound: 0,
        overallAverageRating: 0,
        ratingDistribution: {},
        gameplayStats: { average: 0, min: 0, max: 0, distribution: {} },
        graphicsStats: { average: 0, min: 0, max: 0, distribution: {} },
        storyStats: { average: 0, min: 0, max: 0, distribution: {} },
        soundStats: { average: 0, min: 0, max: 0, distribution: {} }
      };
    }
  }

  /**
   * Ottiene i commenti per una specifica recensione
   */
  static async getReviewComments(reviewGameId: number): Promise<ReviewCommentDto[]> {
    try {
      const response = await communityApi.get<ReviewCommentDto[]>(
        `/review-comments/${reviewGameId}`
      );
      return response.data;
    } catch (error) {
      console.error('Errore nel recupero dei commenti:', error);
      return [];
    }
  }

  /**
   * Aggiunge un commento a una recensione
   */
  static async addReviewComment(createCommentDto: CreateReviewCommentDto): Promise<ReviewCommentDto | null> {
    try {
      const response = await communityApi.post<ReviewCommentDto>(
        '/review-comments',
        createCommentDto
      );
      return response.data;
    } catch (error) {
      console.error('Errore nell\'aggiunta del commento:', error);
      return null;
    }
  }
  /**
   * Elimina un commento a una recensione
   */
  static async deleteReviewComment(commentId: number): Promise<boolean> {
    try {
      await communityApi.delete(`/review-comments/${commentId}`);
      return true;
    } catch (error) {
      console.error('Errore nell\'eliminazione del commento:', error);
      return false;
    }
  }

  // ============ COMMENTI ALLE ATTIVITÀ ============

  /**
   * Ottiene tutti i commenti per un'attività
   */
  static async getActivityComments(activityId: number): Promise<ActivityComment[]> {
    try {
      const response = await communityApi.get<ActivityComment[]>(
        `/activity-comments/${activityId}`
      );
      return response.data;
    } catch (error) {
      console.error('Errore nel recupero dei commenti dell\'attività:', error);
      return [];
    }
  }

  /**
   * Aggiunge un commento a un'attività
   */
  static async addActivityComment(createCommentDto: CreateActivityCommentDto): Promise<ActivityComment | null> {
    try {
      const response = await communityApi.post<ActivityComment>(
        '/activity-comments',
        createCommentDto
      );
      return response.data;
    } catch (error) {
      console.error('Errore nell\'aggiunta del commento all\'attività:', error);
      return null;
    }
  }

  /**
   * Elimina un commento a un'attività
   */
  static async deleteActivityComment(commentId: number): Promise<boolean> {
    try {
      await communityApi.delete(`/activity-comments/${commentId}`);
      return true;
    } catch (error) {
      console.error('Errore nell\'eliminazione del commento dell\'attività:', error);
      return false;
    }
  }

  /**
   * Aggiunge una nuova recensione
   */
  static async addReview(reviewData: any): Promise<boolean> {
    try {
      await communityApi.post('/reviews', reviewData);
      return true;
    } catch (error) {
      console.error('Errore nell\'aggiunta della recensione:', error);
      return false;
    }
  }

}
