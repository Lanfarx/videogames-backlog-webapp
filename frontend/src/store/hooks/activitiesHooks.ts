import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { Activity, ActivityFilters } from '../../types/activity';
import {
  fetchActivities,
  fetchRecentActivities,
  fetchActivitiesByGame,
  fetchActivityStats,
  createActivity as createActivityThunk,
  updateActivity as updateActivityThunk,
  deleteActivity as deleteActivityThunk
} from '../thunks/activityThunks';
import { RootState, AppDispatch } from '..';

export function useAllActivities() {
  const dispatch = useDispatch<AppDispatch>();
  const activities = useSelector((state: RootState) => state.activities.activities);
  const loading = useSelector((state: RootState) => state.activities.loading);
  const activitiesLoaded = useSelector((state: RootState) => state.activities.activitiesLoaded);

  useEffect(() => {
    if (!activitiesLoaded && !loading) {
      dispatch(fetchActivities({}));
    }
  }, [dispatch, activitiesLoaded, loading]);

  return { activities, loading };
}

export function useActivityById(id: number | string): Activity | undefined {
  const { activities } = useAllActivities();
  return activities.find((a: Activity) => a.id === id);
}

export function useAllActivitiesByGameId(GameId: number | string): { activities: Activity[]; loading: boolean } {
  const dispatch = useDispatch<AppDispatch>();
  const allActivities = useSelector((state: RootState) => state.activities.activities);
  const activitiesByGame = useSelector((state: RootState) => state.activities.activitiesByGame[Number(GameId)]);
  const loading = useSelector((state: RootState) => state.activities.loading);

  useEffect(() => {
    if (!activitiesByGame && !loading) {
      dispatch(fetchActivitiesByGame(Number(GameId)));
    }
  }, [dispatch, GameId, activitiesByGame, loading]);

  // Filtra le attività locali se non abbiamo dati specifici per il gioco
  const activities = activitiesByGame || allActivities.filter((a: Activity) => a.gameId === Number(GameId));

  return { activities, loading };
}
 
export function useAllActivitiesByType(type: string): Activity[] {
  const { activities } = useAllActivities();
  return activities.filter((a: Activity) => a.type === type);
}

// Hook per attività recenti
export function useRecentActivities(count: number = 10): { activities: Activity[]; loading: boolean } {
  const dispatch = useDispatch<AppDispatch>();
  const recentActivities = useSelector((state: RootState) => state.activities.recentActivities);
  const loading = useSelector((state: RootState) => state.activities.loading);
  const recentActivitiesLoaded = useSelector((state: RootState) => state.activities.recentActivitiesLoaded);

  useEffect(() => {
    if (!recentActivitiesLoaded && !loading) {
      dispatch(fetchRecentActivities(count));
    }
  }, [dispatch, count, recentActivitiesLoaded, loading]);

  return { 
    activities: recentActivities.slice(0, count), 
    loading 
  };
}

// Hook per attività filtrate per anno
export function useAllActivitiesByYear(year: number): Activity[] {
  const { activities } = useAllActivities();
  return activities.filter((a: Activity) => new Date(a.timestamp).getFullYear() === year);
}

// Hook per attività filtrate per mese e anno
export function useAllActivitiesByMonth(year: number, month: number): Activity[] {
  const { activities } = useAllActivities();
  return activities.filter((a: Activity) => {
    const d = new Date(a.timestamp);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

// Hook per statistiche attività
export function useActivityStats(year?: number): { stats: Record<string, number>; loading: boolean } {
  const dispatch = useDispatch<AppDispatch>();
  const stats = useSelector((state: RootState) => state.activities.stats);
  const loading = useSelector((state: RootState) => state.activities.loading);

  useEffect(() => {
    dispatch(fetchActivityStats(year));
  }, [dispatch, year]);

  return { stats, loading };
}

// Hook per lo stato di caricamento e errori
export function useActivitiesState() {
  return useSelector((state: RootState) => ({
    loading: state.activities.loading,
    error: state.activities.error,
    pagination: state.activities.pagination,
    activitiesLoaded: state.activities.activitiesLoaded,
    recentActivitiesLoaded: state.activities.recentActivitiesLoaded
  }));
}

// Le funzioni di gestione locale delle attività (useAllActivitiesActions) 
// sono state rimosse in favore dell'utilizzo diretto dei thunk asincroni
// per le operazioni CRUD tramite backend API
