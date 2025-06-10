import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ActivityWithReactions } from '../../types/activity';
import { RootState, AppDispatch } from '..';
import { activityReactionService } from '../services/activityReactionService';
import { resetRefetchFlag } from '../slice/activityReactionSlice';

interface ActivitiesWithReactionsState {
  activities: ActivityWithReactions[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
}

/**
 * Hook per recuperare le attività dell'utente corrente con le reazioni
 */
export function useActivitiesWithReactions() {
  const dispatch = useDispatch<AppDispatch>();
  
  // Monitora il flag di invalidazione dal Redux store
  const shouldRefetch = useSelector((state: RootState) => state.activityReactions.shouldRefetchActivitiesWithReactions);
  
  // Utilizziamo uno stato locale per ora, in futuro si potrebbe integrare nel Redux store
  const [state, setState] = React.useState<ActivitiesWithReactionsState>({
    activities: [],
    loading: false,
    error: null,
    loaded: false
  });

  const fetchActivities = useCallback(async () => {
    if (state.loading) return; // Evita fetch multipli simultanei

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const activities = await activityReactionService.getUserActivitiesWithReactions();
      setState(prev => ({ 
        ...prev, 
        activities, 
        loading: false, 
        loaded: true 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Errore nel caricamento delle attività' 
      }));
    }
  }, [state.loading]);

  // Fetch iniziale
  useEffect(() => {
    if (!state.loaded && !state.loading) {
      fetchActivities();
    }
  }, [fetchActivities, state.loaded, state.loading]);

  // Ascolta il flag di invalidazione per fare il refetch automatico
  useEffect(() => {
    if (shouldRefetch) {
      // Reset del flag
      dispatch(resetRefetchFlag());
      // Forza il refetch impostando loaded a false
      setState(prev => ({ ...prev, loaded: false }));
    }
  }, [shouldRefetch, dispatch]);

  const refetch = useCallback(() => {
    setState(prev => ({ ...prev, loaded: false }));
  }, []);

  return {
    activities: state.activities,
    loading: state.loading,
    error: state.error,
    refetch
  };
}

/**
 * Hook per recuperare le attività pubbliche di un utente con le reazioni
 */
export function usePublicActivitiesWithReactions(userIdOrUsername: string | number) {
  const dispatch = useDispatch<AppDispatch>();
  
  // Monitora il flag di invalidazione dal Redux store
  const shouldRefetch = useSelector((state: RootState) => state.activityReactions.shouldRefetchActivitiesWithReactions);
  
  const [state, setState] = React.useState<ActivitiesWithReactionsState>({
    activities: [],
    loading: false,
    error: null,
    loaded: false
  });

  const fetchActivities = useCallback(async () => {
    if (!userIdOrUsername || state.loading) return; // Evita fetch multipli simultanei

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const activities = await activityReactionService.getPublicActivitiesWithReactions(
        typeof userIdOrUsername === 'string' ? parseInt(userIdOrUsername) : userIdOrUsername
      );
      setState(prev => ({ 
        ...prev, 
        activities, 
        loading: false, 
        loaded: true 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Errore nel caricamento delle attività' 
      }));
    }
  }, [userIdOrUsername, state.loading]);

  // Fetch iniziale
  useEffect(() => {
    if (userIdOrUsername && !state.loaded && !state.loading) {
      fetchActivities();
    }
  }, [fetchActivities, userIdOrUsername, state.loaded, state.loading]);

  // Ascolta il flag di invalidazione per fare il refetch automatico
  useEffect(() => {
    if (shouldRefetch && userIdOrUsername) {
      // Reset del flag
      dispatch(resetRefetchFlag());
      // Forza il refetch impostando loaded a false
      setState(prev => ({ ...prev, loaded: false }));
    }
  }, [shouldRefetch, dispatch, userIdOrUsername]);

  const refetch = useCallback(() => {
    setState(prev => ({ ...prev, loaded: false }));
  }, []);

  return {
    activities: state.activities,
    loading: state.loading,
    error: state.error,
    refetch
  };
}

/**
 * Hook per ottenere un'attività specifica con reazioni dall'array caricato
 */
export function useActivityWithReactions(activityId: number) {
  const { activities } = useActivitiesWithReactions();
  
  return activities.find(activity => activity.id === activityId);
}

/**
 * Hook per filtrare le attività con reazioni per anno
 */
export function useActivitiesWithReactionsByYear(year: number) {
  const { activities, loading, error, refetch } = useActivitiesWithReactions();
  
  const filteredActivities = activities.filter(activity => {
    const activityYear = new Date(activity.timestamp).getFullYear();
    return activityYear === year;
  });

  return {
    activities: filteredActivities,
    loading,
    error,
    refetch
  };
}

/**
 * Hook per filtrare le attività con reazioni per mese e anno
 */
export function useActivitiesWithReactionsByMonth(year: number, month: number) {
  const { activities, loading, error, refetch } = useActivitiesWithReactions();
  
  const filteredActivities = activities.filter(activity => {
    const activityDate = new Date(activity.timestamp);
    return activityDate.getFullYear() === year && activityDate.getMonth() === month;
  });

  return {
    activities: filteredActivities,
    loading,
    error,
    refetch
  };
}
