import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { Gamepad2, Clock, Trophy, CalendarRange, Lock, Eye, ArrowRight } from 'lucide-react';
import { getGamesStats } from '../../utils/gamesData';
import StatsCard from '../../components/ui/StatsCard';
import { Link } from 'react-router-dom';
import DiaryFilters from '../../components/diary/DiaryFilters';
import DiaryMonthGroup from '../../components/diary/DiaryMonthGroup';
import { Activity } from '../../types/activity';
import { getAllActivities } from '../../utils/activitiesData';
import { formatLastUpdate } from '../../utils/dateUtils';
import { 
  calculateActivityStats, 
  calculateRecentPlaytime,
  getUniqueMonthsForYear,
  filterActivitiesByYear
} from '../../utils/activityUtils';

// Simulazione dei dati del profilo (in produzione verrebbero dal backend)
const profileData = {
  username: 'utente123',
  fullName: 'Mario Rossi',
  bio: 'Appassionato di videogiochi, soprattutto RPG e giochi d\'avventura. Collezionista di edizioni speciali e memorabilia.',
  avatar: null,
  isPrivate: false,
  memberSince: 'Gennaio 2023',
  tags: ['RPG', 'Avventura', 'PlayStation', 'Steam']
};

const ProfilePage = () => {
  const stats = getGamesStats();
  const [isProfilePrivate, setIsProfilePrivate] = useState(profileData.isPrivate);
  
  // Stato per le opzioni di privacy
  const [privacySettings, setPrivacySettings] = useState({
    showStats: true,
    showDiary: true
  });
  
  // Stati per il diario
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [activeFilters, setActiveFilters] = useState<string[]>(['all']);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showFullDiary, setShowFullDiary] = useState(false);
  
  // Recupera le impostazioni di privacy e carica i dati delle attività
  useEffect(() => {
    const checkPrivacySettings = () => {
      // Controlla l'impostazione di visibilità del profilo
      const savedPrivacySetting = localStorage.getItem('isProfilePublic');
      if (savedPrivacySetting !== null) {
        setIsProfilePrivate(!JSON.parse(savedPrivacySetting));
      }
      
      // Carica le opzioni di privacy
      const savedOptions = localStorage.getItem('privacyOptions');
      if (savedOptions) {
        const options = JSON.parse(savedOptions);
        setPrivacySettings({
          showStats: options.showStats !== undefined ? options.showStats : true,
          showDiary: options.showDiary !== undefined ? options.showDiary : true
        });
      }
      
      // Aggiorna le tag in base alle impostazioni dell'utente
      const savedProfileData = localStorage.getItem('profileData');
      if (savedProfileData) {
        const profileInfo = JSON.parse(savedProfileData);
        if (profileInfo && profileInfo.bio) {
          profileData.bio = profileInfo.bio;
        }
        if (profileInfo && profileInfo.fullName) {
          profileData.fullName = profileInfo.fullName;
        }
        if (profileInfo && profileInfo.username) {
          profileData.username = profileInfo.username;
        }
        if (profileInfo && profileInfo.avatar) {
          profileData.avatar = profileInfo.avatar;
        }
      }
    };
    
    // Carica le attività
    setActivities(getAllActivities());
    
    checkPrivacySettings();
    
    // Aggiorna lo stato quando le impostazioni cambiano
    window.addEventListener('storage', checkPrivacySettings);
    
    return () => {
      window.removeEventListener('storage', checkPrivacySettings);
    };
  }, []);
  
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
  
  // Filtra le attività per l'anno selezionato utilizzando la funzione di utilità
  const yearActivities = filterActivitiesByYear(activities, selectedYear);
  
  // Ottieni mesi unici per l'anno selezionato utilizzando la funzione di utilità
  const months = getUniqueMonthsForYear(activities, selectedYear);

  return (
      <div className="container mx-auto px-4 md:px-8 py-10">
        {/* Sezione Profilo */}
        <div className="bg-primary-bg rounded-lg shadow-sm p-6 mb-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Immagine profilo */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-accent-primary bg-tertiary-bg flex items-center justify-center overflow-hidden">
                {profileData.avatar ? (
                  <img 
                    src={profileData.avatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-accent-primary font-bold text-4xl">
                    {profileData.username.charAt(0).toUpperCase()}
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
                  {profileData.fullName || profileData.username}
                </h1>
                {isProfilePrivate && (
                  <div className="flex items-center text-accent-primary text-sm">
                    <Lock className="h-4 w-4 mr-1" />
                    <span>Profilo privato</span>
                  </div>
                )}
              </div>
              <div className="text-text-secondary mb-4 text-center md:text-left">
                <p className="text-sm">Membro dal {profileData.memberSince}</p>
              </div>
              
              <div className="bg-secondary-bg p-4 rounded-lg mb-4">
                <p className="text-text-secondary font-secondary">
                  {profileData.bio}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {profileData.tags.map((tag, index) => (
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