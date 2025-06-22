import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { RootState } from '../index';
import { useAppDispatch } from '../hooks';
import { Activity, ActivityFilters, ActivityType } from '../../types/activity';
import {
  fetchActivities,
  fetchActivityById,
  fetchRecentActivities,
  fetchActivitiesByGame,
  fetchActivityStats
} from '../thunks/activityThunks';

// Hook per caricare e gestire le attività
export function useLoadActivities(filters?: ActivityFilters, page?: number, pageSize?: number) {
  const dispatch = useAppDispatch();
  const loading = useSelector((state: RootState) => state.activities.loading);
  const error = useSelector((state: RootState) => state.activities.error);
  const activitiesLoaded = useSelector((state: RootState) => state.activities.activitiesLoaded);
  
  useEffect(() => {
    if (!activitiesLoaded && !loading) {
      dispatch(fetchActivities({ filters, page, pageSize }));
    }
  }, [dispatch, activitiesLoaded, loading, filters, page, pageSize]);
  
  return { loading, error, activitiesLoaded };
}

// Hook per ottenere tutte le attività
export function useAllActivities(): Activity[] {
  return useSelector((state: RootState) => state.activities.activities);
}

// Hook per ottenere le attività recenti
export function useRecentActivities(): Activity[] {
  return useSelector((state: RootState) => state.activities.recentActivities);
}

// Hook per caricare le attività recenti
export function useLoadRecentActivities(count: number = 10) {
  const dispatch = useAppDispatch();
  const loading = useSelector((state: RootState) => state.activities.loading);
  const error = useSelector((state: RootState) => state.activities.error);
  const recentActivitiesLoaded = useSelector((state: RootState) => state.activities.recentActivitiesLoaded);
  
  useEffect(() => {
    if (!recentActivitiesLoaded && !loading) {
      dispatch(fetchRecentActivities(count));
    }
  }, [dispatch, recentActivitiesLoaded, loading, count]);
  
  return { loading, error, recentActivitiesLoaded };
}

// Hook per ottenere un'attività specifica per ID
export function useActivityById(id: number): Activity | null {
  const dispatch = useAppDispatch();
  const currentActivity = useSelector((state: RootState) => state.activities.currentActivity);
  const activities = useSelector((state: RootState) => state.activities.activities);
  
  useEffect(() => {
    // Se l'attività non è già caricata, caricala
    if (!currentActivity || currentActivity.id !== id) {
      const existingActivity = activities.find(a => a.id === id);
      if (!existingActivity) {
        dispatch(fetchActivityById(id));
      }
    }
  }, [dispatch, id, currentActivity, activities]);
  
  return currentActivity?.id === id ? currentActivity : activities.find(a => a.id === id) || null;
}

// Hook per ottenere le attività di un gioco specifico
export function useActivitiesByGame(gameId: number): Activity[] {
  const dispatch = useAppDispatch();
  const activitiesByGame = useSelector((state: RootState) => state.activities.activitiesByGame);
  const loading = useSelector((state: RootState) => state.activities.loading);
  
  useEffect(() => {
    if (!activitiesByGame[gameId] && !loading) {
      dispatch(fetchActivitiesByGame(gameId));
    }
  }, [dispatch, gameId, activitiesByGame, loading]);
  
  return activitiesByGame[gameId] || [];
}

// Hook per ottenere le statistiche delle attività
export function useActivityStats(year?: number): Record<string, number> {
  const dispatch = useAppDispatch();
  const stats = useSelector((state: RootState) => state.activities.stats);
  const loading = useSelector((state: RootState) => state.activities.loading);
  
  useEffect(() => {
    if (Object.keys(stats).length === 0 && !loading) {
      dispatch(fetchActivityStats(year));
    }
  }, [dispatch, stats, loading, year]);
  
  return stats;
}

// Hook per ottenere informazioni di paginazione
export function useActivityPagination() {
  return useSelector((state: RootState) => state.activities.pagination);
}

// Hook per ottenere lo stato di loading generale
export function useActivityLoading(): boolean {
  return useSelector((state: RootState) => state.activities.loading);
}

// Hook per ottenere eventuali errori
export function useActivityError(): string | null {
  return useSelector((state: RootState) => state.activities.error);
}

// Hook per filtri specifici
export function useActivitiesByType(type: ActivityType): Activity[] {
  return useSelector((state: RootState) => 
    state.activities.activities.filter(activity => activity.type === type)
  );
}

export function useActivitiesThisMonth(): Activity[] {
  return useSelector((state: RootState) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return state.activities.activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      return activityDate.getMonth() === currentMonth && 
             activityDate.getFullYear() === currentYear;
    });
  });
}

export function useActivitiesThisYear(): Activity[] {
  return useSelector((state: RootState) => {
    const currentYear = new Date().getFullYear();
    
    return state.activities.activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      return activityDate.getFullYear() === currentYear;
    });
  });
}

// Hook per ottenere le attività completate (Completed e Platinum)
export function useCompletedActivities(): Activity[] {
  return useSelector((state: RootState) => 
    state.activities.activities.filter(activity => 
      activity.type === 'Completed' || activity.type === 'Platinum'
    )
  );
}
