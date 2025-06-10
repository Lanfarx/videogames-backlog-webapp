import axios from 'axios';
import { getToken } from '../../utils/getToken';
import { 
  ActivityReaction, 
  ActivityReactionSummary, 
  ActivityWithReactions, 
  CreateActivityReactionDto,
  ActivityType 
} from '../../types/activity';

const API_URL = 'http://localhost:5097/api/activity-reactions';
const ACTIVITY_API_URL = 'http://localhost:5097/api/activity';

// Istanza axios che aggiunge il token JWT se presente
const apiClient = axios.create();
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Mapping da valori numerici enum backend a stringhe frontend (stesso di activityService)
function mapActivityTypeFromApi(backendType: number): ActivityType {
  switch (backendType) {
    case 0: return 'Played';
    case 1: return 'Completed';
    case 2: return 'Added';
    case 3: return 'Rated';
    case 4: return 'Platinum';
    case 5: return 'Abandoned';
    default: return 'Played'; // Fallback
  }
}

// Mappatura da API response a ActivityWithReactions frontend con corretto mapping type
function mapActivityWithReactionsFromApi(apiActivity: any): ActivityWithReactions {
  // Converte reactionCounts in ActivityReactionSummary con userNames vuoto
  // (il backend dovrebbe fornire userNames se necessario, altrimenti usiamo array vuoto)
  const reactionSummary: ActivityReactionSummary[] = Object.entries(apiActivity.reactionCounts || {}).map(([emoji, count]) => ({
    emoji,
    count: count as number,
    userNames: [] // Il backend attualmente non fornisce questa informazione nel summary
  }));

  return {
    id: apiActivity.id,
    type: mapActivityTypeFromApi(apiActivity.type), // Applica il mapping del tipo
    gameId: apiActivity.gameId,
    gameTitle: apiActivity.gameTitle,
    timestamp: apiActivity.timestamp,
    additionalInfo: apiActivity.additionalInfo,
    gameImageUrl: apiActivity.gameImageUrl,
    reactions: apiActivity.reactions || [],
    reactionSummary: reactionSummary
  };
}

/**
 * Servizio per la gestione delle reazioni emoji alle attività
 */
export const activityReactionService = {
  /**
   * Aggiunge o rimuove una reazione (toggle)
   * Se l'utente ha già la stessa reazione, la rimuove, altrimenti la aggiunge
   */
  toggleReaction: async (createReactionDto: CreateActivityReactionDto): Promise<ActivityReaction | null> => {
    const response = await apiClient.post(API_URL, createReactionDto);
    return response.data;
  },

  /**
   * Rimuove una reazione specifica
   */  removeReaction: async (reactionId: number): Promise<void> => {
    await apiClient.delete(`${API_URL}/${reactionId}`);
  },

  /**
   * Ottiene tutte le reazioni per una specifica attività
   */
  getActivityReactions: async (activityId: number): Promise<ActivityReaction[]> => {
    const response = await apiClient.get(`${API_URL}/activity/${activityId}`);
    return response.data.reactions || [];
  },

  /**
   * Ottiene le attività del diary dell'utente corrente con le reazioni
   */
  getUserActivitiesWithReactions: async (page: number = 1, pageSize: number = 20): Promise<ActivityWithReactions[]> => {
    const response = await apiClient.get(`${ACTIVITY_API_URL}`, {
      params: { page, pageSize }
    });
    return response.data.activities.map(mapActivityWithReactionsFromApi);
  },  /**
   * Ottiene le attività pubbliche di un utente con le reazioni (per i profili degli amici)
   */
  getPublicActivitiesWithReactions: async (
    userId: number, 
    page: number = 1, 
    pageSize: number = 20
  ): Promise<ActivityWithReactions[]> => {
    const response = await apiClient.get(`${ACTIVITY_API_URL}/public/${userId}`, {
      params: { page, pageSize }
    });
    return response.data.activities.map(mapActivityWithReactionsFromApi);
  }
};

/**
 * Funzioni di utilità per le reazioni
 */
export const reactionUtils = {
  /**
   * Trova se l'utente corrente ha reagito a un'attività con una specifica emoji
   */
  hasUserReacted: (reactions: ActivityReaction[], currentUserId: number, emoji: string): boolean => {
    return reactions.some(reaction => 
      reaction.userId === currentUserId && reaction.emoji === emoji
    );
  },

  /**
   * Trova la reazione dell'utente corrente per una specifica emoji
   */
  getUserReaction: (reactions: ActivityReaction[], currentUserId: number, emoji: string): ActivityReaction | undefined => {
    return reactions.find(reaction => 
      reaction.userId === currentUserId && reaction.emoji === emoji
    );
  },

  /**
   * Raggruppa le reazioni per emoji e conta gli utenti
   */
  groupReactionsByEmoji: (reactions: ActivityReaction[]): ActivityReactionSummary[] => {
    const grouped = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          userNames: []
        };
      }
      acc[reaction.emoji].count++;
      acc[reaction.emoji].userNames.push(reaction.userUserName);
      return acc;
    }, {} as Record<string, ActivityReactionSummary>);

    return Object.values(grouped);
  },

  /**
   * Lista di emoji comunemente utilizzate per le reazioni
   */
  getCommonEmojis: (): string[] => {
    return ['👍', '❤️', '😄', '😮', '😢', '😡', '🎉', '🔥', '💯', '👏'];
  }
};

export default activityReactionService;
