import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Activity } from '../../types/activity';
import { PaginatedActivitiesDto } from '../services/activityService';
import {
  fetchActivities,
  fetchActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  fetchRecentActivities,
  fetchActivitiesByGame,
  fetchActivityStats
} from '../thunks/activityThunks';
import { addGame, updateGameThunk, updateGameStatusThunk, updateGamePlaytimeThunk } from '../thunks/gamesThunks';

interface ActivityState {
  activities: Activity[];
  recentActivities: Activity[];
  currentActivity: Activity | null;
  activitiesByGame: Record<number, Activity[]>; // GameId -> activities
  stats: Record<string, number>;
  pagination: {
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
  activitiesLoaded: boolean;
  recentActivitiesLoaded: boolean;
}

const initialState: ActivityState = {
  activities: [],
  recentActivities: [],
  currentActivity: null,
  activitiesByGame: {},
  stats: {},
  pagination: {
    totalCount: 0,
    pageSize: 20,
    currentPage: 1,
    totalPages: 0
  },
  loading: false,
  error: null,
  activitiesLoaded: false,
  recentActivitiesLoaded: false
};

const activitySlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    clearCurrentActivity: (state) => {
      state.currentActivity = null;
    },
    clearActivitiesByGame: (state, action: PayloadAction<number>) => {
      delete state.activitiesByGame[action.payload];
    },
    clearAllActivities: (state) => {
      state.activities = [];
      state.recentActivities = [];
      state.currentActivity = null;
      state.activitiesByGame = {};
      state.stats = {};
      state.activitiesLoaded = false;
      state.recentActivitiesLoaded = false;
    },    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
    // I reducer locali (setActivities, addActivity, updateActivityLocal, deleteActivityLocal, clearActivities)
    // sono stati rimossi perché non più utilizzati dopo l'integrazione backend
  },
  extraReducers: (builder) => {
    // Fetch Activities
    builder
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action: PayloadAction<PaginatedActivitiesDto>) => {
        state.loading = false;
        state.activities = action.payload.activities;
        state.pagination = {
          totalCount: action.payload.totalCount,
          pageSize: action.payload.pageSize,
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages
        };
        state.activitiesLoaded = true;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Errore nel caricamento delle attività';
      });

    // Fetch Activity By ID
    builder
      .addCase(fetchActivityById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityById.fulfilled, (state, action: PayloadAction<Activity>) => {
        state.loading = false;
        state.currentActivity = action.payload;
      })
      .addCase(fetchActivityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Errore nel caricamento dell\'attività';
      });

    // Create Activity
    builder
      .addCase(createActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createActivity.fulfilled, (state, action: PayloadAction<Activity>) => {
        state.loading = false;
        state.activities.unshift(action.payload); // Aggiungi all'inizio
        state.recentActivities.unshift(action.payload);
        // Mantieni solo le ultime 10 attività recenti
        if (state.recentActivities.length > 10) {
          state.recentActivities = state.recentActivities.slice(0, 10);
        }
        // Aggiorna anche le attività per gioco se presenti
        const GameId = action.payload.GameId;
        if (state.activitiesByGame[GameId]) {
          state.activitiesByGame[GameId].unshift(action.payload);
        }
      })
      .addCase(createActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Errore nella creazione dell\'attività';
      });

    // Update Activity
    builder
      .addCase(updateActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateActivity.fulfilled, (state, action: PayloadAction<Activity>) => {
        state.loading = false;
        const updatedActivity = action.payload;
        
        // Aggiorna nell'array principale
        const index = state.activities.findIndex(a => a.id === updatedActivity.id);
        if (index !== -1) {
          state.activities[index] = updatedActivity;
        }
        
        // Aggiorna nelle attività recenti
        const recentIndex = state.recentActivities.findIndex(a => a.id === updatedActivity.id);
        if (recentIndex !== -1) {
          state.recentActivities[recentIndex] = updatedActivity;
        }
        
        // Aggiorna nell'attività corrente
        if (state.currentActivity?.id === updatedActivity.id) {
          state.currentActivity = updatedActivity;
        }
        
        // Aggiorna nelle attività per gioco
        const GameId = updatedActivity.GameId;
        if (state.activitiesByGame[GameId]) {
          const gameActivityIndex = state.activitiesByGame[GameId].findIndex(a => a.id === updatedActivity.id);
          if (gameActivityIndex !== -1) {
            state.activitiesByGame[GameId][gameActivityIndex] = updatedActivity;
          }
        }
      })
      .addCase(updateActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Errore nell\'aggiornamento dell\'attività';
      });

    // Delete Activity
    builder
      .addCase(deleteActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteActivity.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        const deletedId = action.payload;
        
        // Rimuovi dall'array principale
        state.activities = state.activities.filter(a => a.id !== deletedId);
        
        // Rimuovi dalle attività recenti
        state.recentActivities = state.recentActivities.filter(a => a.id !== deletedId);
        
        // Rimuovi dall'attività corrente
        if (state.currentActivity?.id === deletedId) {
          state.currentActivity = null;
        }
        
        // Rimuovi dalle attività per gioco
        Object.keys(state.activitiesByGame).forEach(GameId => {
          state.activitiesByGame[parseInt(GameId)] = state.activitiesByGame[parseInt(GameId)].filter(a => a.id !== deletedId);
        });
      })
      .addCase(deleteActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Errore nell\'eliminazione dell\'attività';
      });

    // Fetch Recent Activities
    builder
      .addCase(fetchRecentActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentActivities.fulfilled, (state, action: PayloadAction<Activity[]>) => {
        state.loading = false;
        state.recentActivities = action.payload;
        state.recentActivitiesLoaded = true;
      })
      .addCase(fetchRecentActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Errore nel caricamento delle attività recenti';
      });

    // Fetch Activities By Game
    builder
      .addCase(fetchActivitiesByGame.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivitiesByGame.fulfilled, (state, action) => {
        state.loading = false;
        const { meta, payload } = action;
        const GameId = meta.arg; // Il GameId passato al thunk
        state.activitiesByGame[GameId] = payload;
      })
      .addCase(fetchActivitiesByGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Errore nel caricamento delle attività del gioco';
      });

    // Fetch Activity Stats
    builder
      .addCase(fetchActivityStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityStats.fulfilled, (state, action: PayloadAction<Record<string, number>>) => {
        state.loading = false;
        state.stats = action.payload;
      })      .addCase(fetchActivityStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Errore nel caricamento delle statistiche';
      })
      
      // Invalida le attività quando vengono eseguite operazioni sui giochi che creano attività automatiche
      .addCase(addGame.fulfilled, (state) => {
        // Quando viene aggiunto un gioco, invalida le attività per forzare il ricaricamento
        state.activitiesLoaded = false;
        state.recentActivitiesLoaded = false;
      })
      .addCase(updateGameStatusThunk.fulfilled, (state) => {
        // Quando viene cambiato lo status di un gioco, invalida le attività per forzare il ricaricamento
        state.activitiesLoaded = false;
        state.recentActivitiesLoaded = false;
      })
      .addCase(updateGamePlaytimeThunk.fulfilled, (state) => {
        // Quando vengono aggiornate le ore di gioco, invalida le attività per forzare il ricaricamento
        state.activitiesLoaded = false;
        state.recentActivitiesLoaded = false;
      })
      .addCase(updateGameThunk.fulfilled, (state) => {
        // Quando viene aggiornato un gioco (che può includere status/playtime), invalida le attività
        state.activitiesLoaded = false;
        state.recentActivitiesLoaded = false;
      });
  }
});

export const {
  clearCurrentActivity,
  clearActivitiesByGame,
  clearAllActivities,
  setError
} = activitySlice.actions;

export default activitySlice.reducer;
