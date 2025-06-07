import { useState, useEffect } from 'react';
import { useGamesStats } from '../../store/hooks/index';
import { useAllActivities } from '../../store/hooks/activitiesHooks';
import { Link, useNavigate } from 'react-router-dom';
import { Activity } from '../../types/activity';
import { 
  calculateActivityStats, 
  getUniqueMonthsForYear,
} from '../../utils/activityUtils';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile as getProfileFull } from '../../store/services/profileService';
import { setUserProfile, clearUserProfile } from '../../store/slice/userSlice';
import { resetGamesState } from '../../store/slice/gamesSlice';
import { getToken } from '../../utils/getToken';

// Importa i nuovi componenti
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileStats from '../../components/profile/ProfileStats';
import ProfileDiary from '../../components/profile/ProfileDiary';

const ProfilePage = () => {
  const stats = useGamesStats();
  const { activities: activitiesData, loading: activitiesLoading } = useAllActivities();
  const userProfile = useSelector((state: any) => state.user.profile);

  // Stati per privacy e diario
  const [isProfilePrivate, setIsProfilePrivate] = useState(userProfile?.privacySettings?.isPrivate ?? false);
  const [privacySettings, setPrivacySettings] = useState({
    showStats: userProfile?.privacySettings?.showStats ?? true,
    showDiary: userProfile?.privacySettings?.showDiary ?? true
  });

  // Stati per il diario
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [activeFilters, setActiveFilters] = useState<string[]>(['all']);
  const [activities, setActivities] = useState<Activity[]>([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Carica le attività (solo quelle, non più privacy/profile dallo storage)
  useEffect(() => {
    setActivities(activitiesData);
  }, [activitiesData]);
  // Carica il profilo utente all'avvio della pagina SOLO se non già presente
  useEffect(() => {
    if (!userProfile) {
      const token = getToken();
      if (token) {
        getProfileFull().then(profile => {
          dispatch(setUserProfile(profile));
          setIsProfilePrivate(profile.privacySettings?.isPrivate ?? false);
          setPrivacySettings({
            showStats: profile.privacySettings?.showStats ?? true,
            showDiary: profile.privacySettings?.showDiary ?? true
          });
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile, dispatch]);

  // Gestisce il cambio dei filtri del diario
  const handleFilterChange = (filter: string) => {
    if (filter === 'all') {
      setActiveFilters(['all']);
    } else {
      const newFilters = activeFilters.filter(f => f !== 'all');
      if (newFilters.includes(filter)) {
        // Rimuovi il filtro se già presente
        const updatedFilters = newFilters.filter(f => f !== filter);
        // Se rimosso l'ultimo filtro, imposta su "all"
        setActiveFilters(updatedFilters.length === 0 ? ['all'] : updatedFilters);
      } else {
        // Aggiungi il filtro
        setActiveFilters([...newFilters, filter]);
      }
    }
  };
  
  // Calcola le statistiche per il diario utilizzando le funzioni di utilità
  const diaryStats = calculateActivityStats(activities);
  
  // Ottieni mesi unici per l'anno selezionato utilizzando la funzione di utilità
  const months = getUniqueMonthsForYear(activities, selectedYear);  // Funzione di logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    dispatch(clearUserProfile());
    dispatch(resetGamesState()); // Reset dello stato dei giochi
    window.dispatchEvent(new Event('storage'));
    navigate('/login');  };

  // Placeholder per le statistiche del diario (ora calcolate dinamicamente)
  const placeholderDiaryStats = {
    totalEntries: 0,
    recentPlaytime: 0,
    lastUpdate: null
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-10">
      {/* Header del profilo */}
      <ProfileHeader
        userProfile={userProfile}
        isProfilePrivate={isProfilePrivate}
        isOwnProfile={true}
        onLogout={handleLogout}
      />
      
      {/* Statistiche */}
      <ProfileStats
        stats={stats.stats}
        userProfile={userProfile}
        isPrivate={isProfilePrivate || !privacySettings.showStats}
        showPrivacyIndicator={true}
      />
        {/* Diario di gioco */}
      <ProfileDiary
        activities={activities}
        selectedYear={selectedYear}
        activeFilters={activeFilters}
        diaryStats={placeholderDiaryStats}
        months={months}
        isPrivate={isProfilePrivate || !privacySettings.showDiary}
        showPrivacyIndicator={true}
        onYearChange={setSelectedYear}
        onFilterChange={handleFilterChange}
        isOwnProfile={true}
      />
    </div>
  );
};

export default ProfilePage;