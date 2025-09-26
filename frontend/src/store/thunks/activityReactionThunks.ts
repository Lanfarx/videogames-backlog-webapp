import { createAsyncThunk } from '@reduxjs/toolkit';
import { activityReactionService } from '../services/activityReactionService';
import { 
  CreateActivityReactionDto 
} from '../../types/activity';
import { invalidateActivitiesWithReactions } from '../slice/activityReactionSlice';

/**
 * Aggiunge o rimuove una reazione (toggle)
 * Dopo aver modificato la reazione, aggiorna solo le reazioni di quella specifica attività
 */
export const toggleActivityReaction = createAsyncThunk(
  'activityReactions/toggle',
  async (createReactionDto: CreateActivityReactionDto, { dispatch }) => {
    const result = await activityReactionService.toggleReaction(createReactionDto);
    
    // Dopo aver modificato la reazione, aggiorna solo le reazioni di questa attività
    await dispatch(fetchActivityReactions(createReactionDto.activityId));
    
    // Invalida le attività per far scattare il refetch nell'hook
    dispatch(invalidateActivitiesWithReactions());
    
    return result;
  }
);

/**
 * Rimuove una reazione specifica
 * Dopo aver rimosso la reazione, aggiorna solo le reazioni di quella specifica attività
 */
export const removeActivityReaction = createAsyncThunk(
  'activityReactions/remove',
  async (params: { reactionId: number; activityId: number }, { dispatch }) => {
    await activityReactionService.removeReaction(params.reactionId);
    
    // Dopo aver rimosso la reazione, aggiorna solo le reazioni di questa attività
    dispatch(fetchActivityReactions(params.activityId));
    
    // Invalida le attività per far scattare il refetch nell'hook
    dispatch(invalidateActivitiesWithReactions());
    
    return params.reactionId;
  }
);

/**
 * Ottiene le reazioni per una specifica attività
 */
export const fetchActivityReactions = createAsyncThunk(
  'activityReactions/fetchActivity',
  async (activityId: number) => {
    const reactions = await activityReactionService.getActivityReactions(activityId);
    return { activityId, reactions };
  }
);

/**
 * Ottiene le attività dell'utente corrente dal diary con reazioni  
 */
export const fetchUserDiaryWithReactions = createAsyncThunk(
  'activityReactions/fetchUserDiary',
  async (params: { page?: number; pageSize?: number } = {}) => {
    const { page = 1, pageSize = 1000 } = params; // Aumentato pageSize per caricare tutte le attività
    return await activityReactionService.getUserActivitiesWithReactions(page, pageSize);
  }
);

/**
 * Ottiene le attività pubbliche di un amico dal diary con reazioni
 */
export const fetchFriendDiaryWithReactions = createAsyncThunk(
  'activityReactions/fetchFriendDiary',
  async (params: { userId: number; page?: number; pageSize?: number }) => {
    const { userId, page = 1, pageSize = 1000 } = params; // Aumentato pageSize per caricare tutte le attività
    return await activityReactionService.getPublicActivitiesWithReactions(userId, page, pageSize);
  }
);
