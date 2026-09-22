import { useState, useEffect, useCallback } from 'react';
import { usePublicProfile } from '../store/hooks/friendshipHooks';
import { usePublicActivitiesWithReactions } from '../store/hooks/activitiesWithReactionsHooks';
import { Activity, ActivityWithReactions } from '../types/activity';
import { getPublicActivities } from '../store/services/activityService';
import { getUniqueMonthsForYear } from '../utils/activityUtils';

export function usePublicProfileView(userName: string | undefined) {
  const { profile, loading, error, loadProfile, loadProfileByUsername } = usePublicProfile();
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [activeFilters, setActiveFilters] = useState<string[]>(['all']);
  
  const [publicActivities, setPublicActivities] = useState<(Activity | ActivityWithReactions)[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  
  const userId = profile?.userId;
  const { 
    activities: activitiesWithReactions, 
    loading: reactionsLoading 
  } = usePublicActivitiesWithReactions(userId && profile?.isFriend ? userId : 0);

  useEffect(() => {
    if (!profile || !userName) return;
    if (profile.isProfilePrivate && !profile.isFriend) return;
    if (!profile.canViewDiary) return;
    if (profile.isFriend) return;

    const abortController = new AbortController();
    
    const loadPublicActivities = async () => {
      setLoadingActivities(true);
      try {
        const result = await getPublicActivities(
          userName,
          {},
          1,
          1000,
          abortController.signal
        );
        setPublicActivities(result.activities);
      } catch (error: any) {
        if (error.name === 'CanceledError' || error.message === 'canceled') return;
        console.error('Errore nel caricamento delle attività pubbliche:', error);
        setPublicActivities([]);
      } finally {
        setLoadingActivities(false);
      }
    };

    loadPublicActivities();
    
    return () => abortController.abort();
  }, [profile, userName]);

  const activities = profile?.isFriend ? activitiesWithReactions : publicActivities;

  useEffect(() => {
    if (profile?.isFriend) {
      setLoadingActivities(reactionsLoading);
    }
  }, [profile?.isFriend, reactionsLoading]);

  const handleFilterChange = useCallback((filter: string) => {
    if (filter === 'all') {
      setActiveFilters(['all']);
    } else {
      setActiveFilters(prev => {
        const newFilters = prev.filter(f => f !== 'all');
        if (newFilters.includes(filter)) {
          const updatedFilters = newFilters.filter(f => f !== filter);
          return updatedFilters.length === 0 ? ['all'] : updatedFilters;
        } else {
          return [...newFilters, filter];
        }
      });
    }
  }, []);

  const months = (activities.length > 0 && profile?.canViewDiary && (!profile?.isProfilePrivate || profile?.isFriend)) 
    ? getUniqueMonthsForYear(activities, selectedYear) 
    : [];

  const reloadProfile = useCallback((identifier: string | number) => {
    if (typeof identifier === 'number') {
      loadProfile(identifier);
    } else {
      loadProfileByUsername(identifier);
    }
  }, [loadProfile, loadProfileByUsername]);

  useEffect(() => {
    if (userName) {
      if (/^\d+$/.test(userName)) {
        loadProfile(parseInt(userName, 10));
      } else {
        loadProfileByUsername(userName);
      }
    }
  }, [userName, loadProfile, loadProfileByUsername]);

  return {
    profile,
    loading,
    error,
    selectedYear,
    setSelectedYear,
    activeFilters,
    handleFilterChange,
    activities,
    loadingActivities,
    months,
    reloadProfile
  };
}
