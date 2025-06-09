import axios from 'axios';
import { getToken } from '../utils/getToken';
import { ActivityComment, CreateActivityCommentDto } from '../types/activity';
import { ReviewCommentDto, CreateReviewCommentDto } from '../types/community';

// Crea istanza axios per le API
const apiClient = axios.create();
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ============ API DIRETTE PER COMMENTI ATTIVITÀ ============

/**
 * Ottiene tutti i commenti per un'attività
 */
export const fetchActivityComments = async (activityId: number): Promise<ActivityComment[]> => {
  try {
    const response = await apiClient.get<ActivityComment[]>(`/api/Community/activity-comments/${activityId}`);
    return response.data;
  } catch (error) {
    console.error('Errore nel caricamento dei commenti dell\'attività:', error);
    throw error;
  }
};

/**
 * Aggiunge un commento a un'attività
 */
export const addActivityComment = async (dto: CreateActivityCommentDto): Promise<ActivityComment> => {
  try {
    const response = await apiClient.post<ActivityComment>('/api/Community/activity-comments', dto);
    return response.data;
  } catch (error) {
    console.error('Errore nell\'aggiunta del commento all\'attività:', error);
    throw error;
  }
};

/**
 * Elimina un commento a un'attività
 */
export const deleteActivityComment = async (commentId: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/Community/activity-comments/${commentId}`);
  } catch (error) {
    console.error('Errore nell\'eliminazione del commento dell\'attività:', error);
    throw error;
  }
};

// ============ API DIRETTE PER COMMENTI RECENSIONI ============

/**
 * Ottiene tutti i commenti per una recensione
 */
export const fetchReviewComments = async (reviewGameId: number): Promise<ReviewCommentDto[]> => {
  try {
    const response = await apiClient.get<ReviewCommentDto[]>(`/api/Community/review-comments/${reviewGameId}`);
    return response.data;
  } catch (error) {
    console.error('Errore nel caricamento dei commenti della recensione:', error);
    throw error;
  }
};

/**
 * Aggiunge un commento a una recensione
 */
export const addReviewComment = async (dto: CreateReviewCommentDto): Promise<ReviewCommentDto> => {
  try {
    const response = await apiClient.post<ReviewCommentDto>('/api/Community/review-comments', dto);
    return response.data;
  } catch (error) {
    console.error('Errore nell\'aggiunta del commento alla recensione:', error);
    throw error;
  }
};

/**
 * Elimina un commento a una recensione
 */
export const deleteReviewComment = async (commentId: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/Community/review-comments/${commentId}`);
  } catch (error) {
    console.error('Errore nell\'eliminazione del commento della recensione:', error);
    throw error;
  }
};
