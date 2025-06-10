import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  ActivityReaction, 
  ActivityWithReactions 
} from '../../types/activity';
import {
  toggleActivityReaction,
  removeActivityReaction,
  fetchUserDiaryWithReactions,
  fetchFriendDiaryWithReactions,
  fetchActivityReactions
} from '../thunks/activityReactionThunks';

interface ActivityReactionState {
  // Attività con reazioni
  activitiesWithReactions: ActivityWithReactions[];
  publicActivitiesWithReactions: Record<number, ActivityWithReactions[]>; // userId -> activities
  
  // Reazioni per singole attività (activityId -> reactions)
  reactionsByActivity: Record<number, ActivityReaction[]>;
  
  // Stato di caricamento e errori
  loading: boolean;
  error: string | null;
  
  // Flags per tenere traccia di cosa è stato caricato
  userActivitiesLoaded: boolean;
  publicActivitiesLoaded: Record<number, boolean>; // userId -> loaded
  
  // Flag per indicare quando le attività con reazioni devono essere ricaricate
  shouldRefetchActivitiesWithReactions: boolean;
}

const initialState: ActivityReactionState = {
  activitiesWithReactions: [],
  publicActivitiesWithReactions: {},
  reactionsByActivity: {},
  loading: false,
  error: null,
  userActivitiesLoaded: false,
  publicActivitiesLoaded: {},
  shouldRefetchActivitiesWithReactions: false
};

const activityReactionSlice = createSlice({
  name: 'activityReactions',
  initialState,  reducers: {
    clearActivityReactions: (state, action: PayloadAction<number>) => {
      delete state.reactionsByActivity[action.payload];
    },
    clearAllReactions: (state) => {
      state.activitiesWithReactions = [];
      state.publicActivitiesWithReactions = {};
      state.reactionsByActivity = {};
      state.userActivitiesLoaded = false;
      state.publicActivitiesLoaded = {};
      state.shouldRefetchActivitiesWithReactions = false;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    invalidateActivitiesWithReactions: (state) => {
      state.shouldRefetchActivitiesWithReactions = true;
    },
    resetRefetchFlag: (state) => {
      state.shouldRefetchActivitiesWithReactions = false;
    }
  },
  extraReducers: (builder) => {
    // Toggle Reaction
    builder
      .addCase(toggleActivityReaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleActivityReaction.fulfilled, (state, action) => {
        state.loading = false;
        const reaction = action.payload;
        const activityId = action.meta.arg.activityId;
        
        if (reaction) {
          // Aggiunta della reazione
          if (!state.reactionsByActivity[activityId]) {
            state.reactionsByActivity[activityId] = [];
          }
          state.reactionsByActivity[activityId].push(reaction);
          
          // Aggiorna anche nelle attività con reazioni
          updateActivityReactions(state, activityId, state.reactionsByActivity[activityId]);
        } else {
          // Rimozione della reazione (il backend ha restituito null)
          // Rimuovi la reazione esistente dall'utente con la stessa emoji
          const emoji = action.meta.arg.emoji;
          // Dovremmo avere l'userId dell'utente corrente per filtrare correttamente
          // Per ora rimuoviamo tutte le reazioni con quella emoji (da migliorare)
          if (state.reactionsByActivity[activityId]) {
            state.reactionsByActivity[activityId] = state.reactionsByActivity[activityId].filter(
              r => r.emoji !== emoji
            );
            updateActivityReactions(state, activityId, state.reactionsByActivity[activityId]);
          }
        }
      })
      .addCase(toggleActivityReaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Errore nel toggle della reazione';
      });

    // Remove Reaction
    builder
      .addCase(removeActivityReaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })      .addCase(removeActivityReaction.fulfilled, (state, action) => {
        state.loading = false;
        const reactionId = action.payload;
        
        // Rimuovi la reazione da tutte le attività
        Object.keys(state.reactionsByActivity).forEach(activityIdStr => {
          const activityId = parseInt(activityIdStr);
          state.reactionsByActivity[activityId] = state.reactionsByActivity[activityId]?.filter(
            r => r.id !== reactionId
          ) || [];
          updateActivityReactions(state, activityId, state.reactionsByActivity[activityId]);
        });
      }).addCase(removeActivityReaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Errore nella rimozione della reazione';
      })

      // Fetch User Diary With Reactions
      .addCase(fetchUserDiaryWithReactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDiaryWithReactions.fulfilled, (state, action) => {
        state.loading = false;
        state.activitiesWithReactions = action.payload;
        state.userActivitiesLoaded = true;
        
        // Aggiorna anche il cache delle reazioni per singole attività
        action.payload.forEach(activity => {
          state.reactionsByActivity[activity.id] = activity.reactions;
        });
      })
      .addCase(fetchUserDiaryWithReactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Errore nel caricamento del diary con reazioni';      })

      // Fetch Friend Diary With Reactions
      .addCase(fetchFriendDiaryWithReactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFriendDiaryWithReactions.fulfilled, (state, action) => {
        state.loading = false;
        const userId = action.meta.arg.userId;
        state.publicActivitiesWithReactions[userId] = action.payload;
        state.publicActivitiesLoaded[userId] = true;
        
        // Aggiorna anche il cache delle reazioni per singole attività
        action.payload.forEach(activity => {
          state.reactionsByActivity[activity.id] = activity.reactions;
        });
      })      .addCase(fetchFriendDiaryWithReactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Errore nel caricamento del diary dell\'amico con reazioni';
      })

      // Fetch Activity Reactions (endpoint specifico)
      .addCase(fetchActivityReactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityReactions.fulfilled, (state, action) => {
        state.loading = false;
        const { activityId, reactions } = action.payload;
        
        // Aggiorna il cache delle reazioni per la specifica attività
        state.reactionsByActivity[activityId] = reactions;
        
        // Aggiorna anche le reazioni nelle attività caricate
        updateActivityReactions(state, activityId, reactions);
      })
      .addCase(fetchActivityReactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Errore nel caricamento delle reazioni dell\'attività';
      });
  }
});

/**
 * Funzione helper per aggiornare le reazioni nelle attività
 */
function updateActivityReactions(
  state: ActivityReactionState, 
  activityId: number, 
  reactions: ActivityReaction[]
) {
  // Aggiorna nelle attività dell'utente
  const userActivityIndex = state.activitiesWithReactions.findIndex(a => a.id === activityId);
  if (userActivityIndex !== -1) {
    state.activitiesWithReactions[userActivityIndex].reactions = reactions;
    // Ricalcola il summary
    state.activitiesWithReactions[userActivityIndex].reactionSummary = calculateReactionSummary(reactions);
  }
  
  // Aggiorna nelle attività pubbliche di tutti gli utenti
  Object.keys(state.publicActivitiesWithReactions).forEach(userIdStr => {
    const userId = parseInt(userIdStr);
    const publicActivityIndex = state.publicActivitiesWithReactions[userId]?.findIndex(a => a.id === activityId);
    if (publicActivityIndex !== undefined && publicActivityIndex !== -1) {
      state.publicActivitiesWithReactions[userId][publicActivityIndex].reactions = reactions;
      state.publicActivitiesWithReactions[userId][publicActivityIndex].reactionSummary = calculateReactionSummary(reactions);
    }
  });
}

/**
 * Calcola il summary delle reazioni raggruppate per emoji
 */
function calculateReactionSummary(reactions: ActivityReaction[]) {
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
  }, {} as Record<string, any>);

  return Object.values(grouped);
}

export const { 
  clearActivityReactions, 
  clearAllReactions, 
  setError, 
  invalidateActivitiesWithReactions, 
  resetRefetchFlag 
} = activityReactionSlice.actions;
export default activityReactionSlice.reducer;
