import { useState, useEffect } from 'react';
import { Gamepad2, Clock, Trophy, CalendarRange, Lock, Eye, ArrowRight } from 'lucide-react';
import { useGamesStats } from '../../store/hooks/index';
import { useAllActivities } from '../../store/hooks/activitiesHooks';
import StatsCard from '../../components/ui/StatsCard';
import { Link, useNavigate } from 'react-router-dom';
import DiaryFilters from '../../components/diary/DiaryFilters';
import DiaryMonthGroup from '../../components/diary/DiaryMonthGroup';
import { Activity } from '../../types/activity';
import { formatLastUpdate } from '../../utils/dateUtils';
import { 
  calculateActivityStats, 
  getUniqueMonthsForYear,
} from '../../utils/activityUtils';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile as getProfileFull } from '../../store/services/profileService';
import { setUserProfile } from '../../store/slice/userSlice';
import { getToken } from '../../utils/getToken';

const ProfilePage = () => {
  const stats = useGamesStats();
  const activitiesData = useAllActivities();
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
        getProfileFull(token).then(profile => {
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
  const months = getUniqueMonthsForYear(activities, selectedYear);

  // Funzione di logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
  };

  return (
      <div className="container mx-auto px-4 md:px-8 py-10">
        {/* Sezione Profilo */}
        <div className="bg-primary-bg rounded-lg shadow-sm p-6 mb-10 relative">
          {/* Pulsante Logout in alto a destra */}
          <button
            onClick={handleLogout}
            className="absolute top-6 right-6 bg-accent-danger hover:bg-accent-primary/90 focus:ring-2 focus:ring-accent-primary text-white font-secondary text-base shadow-md border-0 transition-colors duration-150 px-8 py-2 rounded-lg h-12 min-w-[140px] z-10"
            style={{ minWidth: 0, height: 'auto', fontSize: '1rem' }}
          >
            Logout
          </button>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Immagine profilo */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-accent-primary bg-tertiary-bg flex items-center justify-center overflow-hidden">
                {userProfile.avatar ? (
                  <img 
                    src={userProfile.avatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-accent-primary font-bold text-4xl">
                    {userProfile.UserName ? userProfile.UserName.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
              </div>
              {isProfilePrivate && (
                <div className="absolute -top-2 -right-2 bg-secondary-bg p-1.5 rounded-full border-2 border-border-color">
                  <Lock className="h-4 w-4 text-accent-primary" />
                </div>
              )}
            </div>
            
            {/* Informazioni profilo */}
            <div className="flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-3xl font-bold text-text-primary font-primary">
                  {userProfile.fullName || userProfile.UserName}
                </h1>
                {isProfilePrivate && (
                  <div className="flex items-center text-accent-primary text-sm">
                    <Lock className="h-4 w-4 mr-1" />
                    <span>Profilo privato</span>
                  </div>
                )}
              </div>
              <div className="text-text-secondary mb-4 text-center md:text-left">
                <p className="text-sm">Membro dal {userProfile.memberSince ? new Date(userProfile.memberSince).toLocaleDateString('it-IT') : ''}</p>
              </div>
              
              <div className="bg-secondary-bg p-4 rounded-lg mb-4">
                <p className="text-text-secondary font-secondary">
                  {userProfile.bio}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(userProfile.tags) ? userProfile.tags : typeof userProfile.tags === 'string' && userProfile.tags.length > 0 ? userProfile.tags.split(',') : []).map((tag: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-tertiary-bg text-text-secondary text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Statistiche con indicatore di visibilità */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary font-primary">Le mie statistiche</h2>
            {(isProfilePrivate || !privacySettings.showStats) && (
              <div className="flex items-center text-accent-primary text-sm bg-secondary-bg px-3 py-1 rounded-full">
                <Eye className="h-4 w-4 mr-1" />
                <span>Visibile solo a te</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard 
              label="Totale giochi" 
              value={stats.total.toString()} 
              icon={<Gamepad2 className="h-8 w-8 text-accent-primary" />}
            />
            <StatsCard 
              label="Ore giocate" 
              value={stats.totalHours.toString()} 
              icon={<Clock className="h-8 w-8 text-accent-primary" />}
            />
            <StatsCard 
              label="Giochi completati" 
              value={stats.completed.toString()} 
              icon={<Trophy className="h-8 w-8 text-accent-primary" />}
            />
            <StatsCard 
              label="Giorni di attività" 
              value={"127"} 
              icon={<CalendarRange className="h-8 w-8 text-accent-primary" />}
            />
          </div>
        </div>
        
        {/* Diario di gioco */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary font-primary">Diario di gioco</h2>
            <div className="flex items-center gap-3">
              {(isProfilePrivate || !privacySettings.showDiary) && (
                <div className="flex items-center text-accent-primary text-sm bg-secondary-bg px-3 py-1 rounded-full">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>Visibile solo a te</span>
                </div>
              )}
              <Link 
                to="/diario" 
                className="flex items-center text-sm text-accent-primary hover:underline"
              >
                <span>Visualizza completo</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          
          {/* Incorporamento della pagina DiarioPage senza l'header e il layout */}
          <div className="bg-primary-bg rounded-lg shadow-sm p-6">
            {/* Statistiche del diario */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-secondary-bg p-6 rounded-lg shadow-sm flex items-center">
                <CalendarRange className="w-10 h-10 text-accent-primary mr-4" />
                <div>
                  <p className="text-sm text-text-secondary">Voci totali</p>
                  <p className="text-2xl font-bold text-text-primary">{diaryStats.totalEntries}</p>
                </div>
              </div>
              
              <div className="bg-secondary-bg p-6 rounded-lg shadow-sm flex items-center">
                <Clock className="w-10 h-10 text-accent-primary mr-4" />
                <div>
                  <p className="text-sm text-text-secondary">Tempo di gioco (ultime 2 settimane)</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {diaryStats.recentPlaytime}h
                  </p>
                </div>
              </div>
              
              <div className="bg-secondary-bg p-6 rounded-lg shadow-sm flex items-center">
                <CalendarRange className="w-10 h-10 text-accent-primary mr-4" />
                <div>
                  <p className="text-sm text-text-secondary">Ultimo aggiornamento</p>
                  <p className="text-2xl font-bold text-text-primary">{formatLastUpdate(diaryStats.lastUpdate)}</p>
                </div>
              </div>
            </div>
            
            {/* Filtri del diario */}
            {activities.length > 0 && (
              <div className="mb-4">
                <DiaryFilters 
                  year={selectedYear}
                  onYearChange={setSelectedYear}
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                />
              </div>
            )}
            
            {/* Contenuto del diario */}
            {activities.length > 0 ? (
              <div>
                {/* Visualizza solo il mese più recente nel profilo */}
                {months.length > 0 && (
                  <div className="space-y-6">
                    <DiaryMonthGroup 
                      key={`${selectedYear}-${months[0]}`}
                      month={months[0]}
                      year={selectedYear}
                      activities={activities}
                      activeFilters={activeFilters}
                    />
                    
                    {/* Se ci sono altri mesi, mostra un link per visualizzare tutto */}
                    {months.length > 1 && (
                      <div className="text-center mt-4">
                        <Link 
                          to="/diario" 
                          className="inline-flex items-center px-4 py-2 bg-secondary-bg text-text-primary rounded-lg hover:bg-tertiary-bg transition-colors"
                        >
                          Visualizza tutti i {months.length} mesi
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <h3 className="text-xl font-bold text-text-primary font-primary mb-4">
                  Nessuna attività registrata
                </h3>
                <p className="text-text-secondary font-secondary max-w-2xl mx-auto mb-6">
                  Non hai ancora registrato attività nel tuo diario di gioco. Inizia ad aggiungere attività per tenere traccia delle tue esperienze videoludiche!
                </p>
                <Link 
                  to="/diario" 
                  className="inline-flex items-center px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
                >
                  Vai al diario completo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default ProfilePage;