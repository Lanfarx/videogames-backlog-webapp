import { useSelector } from 'react-redux';
import { useEffect, useCallback } from 'react';
import { RootState } from '../index';
import { useAppDispatch } from '../hooks';
import { 
  ActivityWithReactions
} from '../../types/activity';
import {
  fetchUserDiaryWithReactions,
  fetchFriendDiaryWithReactions
} from '../thunks/activityReactionThunks';

/**
 * Hook per ottenere le attività dell'utente corrente con reazioni
 */
export function useUserActivitiesWithReactions() {
  const dispatch = useAppDispatch();
  const activities = useSelector((state: RootState) => state.activityReactions.activitiesWithReactions);
  const loading = useSelector((state: RootState) => state.activityReactions.loading);
  const error = useSelector((state: RootState) => state.activityReactions.error);
  const userActivitiesLoaded = useSelector((state: RootState) => state.activityReactions.userActivitiesLoaded);

  useEffect(() => {
    if (!userActivitiesLoaded && !loading) {
      dispatch(fetchUserDiaryWithReactions({}));
    }
  }, [dispatch, userActivitiesLoaded, loading]);

  const refreshActivities = useCallback((page?: number, pageSize?: number) => {
    dispatch(fetchUserDiaryWithReactions({ page, pageSize }));
  }, [dispatch]);

  return {
    activities,
    loading,
    error,
    refreshActivities
  };
}

/**
 * Hook per ottenere le attività pubbliche di un utente con reazioni
 */
export function usePublicActivitiesWithReactions(userId: number) {
  const dispatch = useAppDispatch();
  const activities = useSelector((state: RootState) => 
    state.activityReactions.publicActivitiesWithReactions[userId] || []
  );
  const loading = useSelector((state: RootState) => state.activityReactions.loading);
  const error = useSelector((state: RootState) => state.activityReactions.error);
  const publicActivitiesLoaded = useSelector((state: RootState) => 
    state.activityReactions.publicActivitiesLoaded[userId] || false
  );

  useEffect(() => {
    if (!publicActivitiesLoaded && !loading && userId) {
      dispatch(fetchFriendDiaryWithReactions({ userId }));
    }
  }, [dispatch, userId, publicActivitiesLoaded, loading]);

  const refreshActivities = useCallback((page?: number, pageSize?: number) => {
    dispatch(fetchFriendDiaryWithReactions({ userId, page, pageSize }));
  }, [dispatch, userId]);

  return {
    activities,
    loading,
    error,
    refreshActivities
  };
}

/**
 * Hook per ottenere lo stato generale delle reazioni
 */
export function useActivityReactionsState() {
  return useSelector((state: RootState) => ({
    loading: state.activityReactions.loading,
    error: state.activityReactions.error,
    userActivitiesLoaded: state.activityReactions.userActivitiesLoaded
  }));
}
