import { useSelector, useDispatch } from 'react-redux';
import { Activity } from '../../types/activity';
import {
  setActivities,
  addActivity,
  updateActivity,
  deleteActivity,
  clearActivities,
} from '../slice/activitiesSlice';
import { RootState } from '..';

export function useAllActivities() {
  return useSelector((state: RootState) => state.activities.activities);
}

export function useActivityById(id: number | string): Activity | undefined {
  return useSelector((state: RootState) => state.activities.activities.find(a => a.id === id));
}

export function useAllActivitiesByGameId(gameId: number | string): Activity[] {
  return useSelector((state: RootState) => state.activities.activities.filter(a => a.gameId === gameId));
}

export function useAllActivitiesByType(type: string): Activity[] {
  return useSelector((state: RootState) => state.activities.activities.filter(a => a.type === type));
}

// Hook per attività recenti
export function useRecentActivities(count: number) {
  const activities = useAllActivities();
  // Ordina le attività per timestamp (dalla più recente alla più vecchia)
  const sortedActivities = [...activities].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return sortedActivities.slice(0, count);
}

// Hook per attività filtrate per anno
export function useAllActivitiesByYear(year: number) {
  const activities = useAllActivities();
  return activities.filter(a => new Date(a.timestamp).getFullYear() === year);
}

// Hook per attività filtrate per mese e anno
export function useAllActivitiesByMonth(year: number, month: number) {
  const activities = useAllActivities();
  return activities.filter(a => {
    const d = new Date(a.timestamp);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

export function useAllActivitiesActions() {
  const dispatch = useDispatch();
  return {
    setActivities: (activities: Activity[]) => dispatch(setActivities(activities)),
    addActivity: (activity: Activity) => dispatch(addActivity(activity)),
    updateActivity: (activity: Activity) => dispatch(updateActivity(activity)),
    deleteActivity: (id: number | string) => dispatch(deleteActivity(id)),
    clearActivities: () => dispatch(clearActivities()),
  };
}
