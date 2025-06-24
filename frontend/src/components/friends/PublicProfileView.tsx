import React, { useEffect, useState } from 'react';
import { User, ArrowLeft, UserPlus, UserMinus, Ban, UserCheck, UserX } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFriendshipActions, usePublicProfile } from '../../store/hooks/friendshipHooks';
import { useFriendsNavigation } from '../../store/hooks/navigationHooks';
import { usePublicActivitiesWithReactions } from '../../store/hooks/activitiesWithReactionsHooks';
import { Activity, ActivityWithReactions } from '../../types/activity';
import { getPublicActivities } from '../../store/services/activityService';
import { 
  calculateActivityStats, 
  getUniqueMonthsForYear,
} from '../../utils/activityUtils';

// Import dei nuovi componenti riutilizzabili
import ProfileHeader from '../profile/ProfileHeader';
import ProfileStats from '../profile/ProfileStats';
import ProfileDiary from '../profile/ProfileDiary';

interface PublicProfileViewProps {
  className?: string;
  userName?: string; // Aggiungiamo userName come prop opzionale per quando non viene dalla URL
}

const PublicProfileView: React.FC<PublicProfileViewProps> = ({ className = '', userName: propUserName }) => {
  const { userName: urlUserName } = useParams<{ userName: string }>();
  const userName = propUserName || urlUserName;
  const navigate = useNavigate();
  const { navigateToSentRequests, navigateToFriends } = useFriendsNavigation();
  const { 
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest, 
    removeFriend, 
    blockUser
  } = useFriendshipActions();
  
  const { profile, loading, error, loadProfile, loadProfileByUsername } = usePublicProfile();  // Stati per il diario (simili a ProfilePage)
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [activeFilters, setActiveFilters] = useState<string[]>(['all']);
  const [activities, setActivities] = useState<(Activity | ActivityWithReactions)[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  // Usa attività con reazioni se l'utente è amico
  const userId = profile?.userId;
  const { 
    activities: activitiesWithReactions, 
    loading: reactionsLoading 
  } = usePublicActivitiesWithReactions(userId && profile?.isFriend ? userId : 0);

  // Caricamento delle attività pubbliche (senza reazioni) per utenti non amici
  useEffect(() => {
    const loadPublicActivities = async () => {
      // Non caricare le attività se:
      // 1. Non abbiamo il profilo
      // 2. Il profilo è privato e non siamo amici
      // 3. Non possiamo vedere il diario
      // 4. L'utente è amico (in questo caso usiamo activitiesWithReactions)
      if (!profile || !userName) return;
      if (profile.isProfilePrivate && !profile.isFriend) return;
      if (!profile.canViewDiary) return;
      if (profile.isFriend) return; // Se è amico, usa activitiesWithReactions
      
      setLoadingActivities(true);
      try {
        const result = await getPublicActivities(
          userName,
          {}, // Non filtriamo per anno qui, lasciamo che ProfileDiary gestisca il filtraggio
          1,
          100 // Carichiamo più attività per il profilo
        );
        setActivities(result.activities);
      } catch (error) {
        console.error('Errore nel caricamento delle attività pubbliche:', error);
        setActivities([]);
      } finally {
        setLoadingActivities(false);
      }
    };

    loadPublicActivities();
  }, [profile, userName]);
  // Aggiorna le attività quando arrivano quelle con reazioni
  useEffect(() => {
    if (profile?.isFriend && activitiesWithReactions.length >= 0) { // Cambiato da > 0 a >= 0 per includere array vuoti
      setActivities(activitiesWithReactions);
      setLoadingActivities(reactionsLoading);
    }
  }, [activitiesWithReactions, profile?.isFriend, reactionsLoading]);
  // Gestione filtri diario (simile a DiarioPage)
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
  };  // Calcolo mesi disponibili per il diario - solo se possiamo vedere il diario
  const months = (activities.length > 0 && profile?.canViewDiary && (!profile?.isProfilePrivate || profile?.isFriend)) 
    ? getUniqueMonthsForYear(activities, selectedYear) 
    : [];
  
  // Statistiche del diario ora calcolate dinamicamente nel componente
  const placeholderDiaryStats = {
    totalEntries: 0,
    recentPlaytime: 0,
    lastUpdate: null
  };

  useEffect(() => {
    if (userName) {
      // Se userName è numerico, usa loadProfile, altrimenti loadProfileByUsername
      const userId = parseInt(userName);
      if (!isNaN(userId)) {
        loadProfile(userId);
      } else {
        loadProfileByUsername(userName);
      }
    }
  }, [userName, loadProfile, loadProfileByUsername]);  const handleAction = async (action: string) => {
    if (!profile) return;
    try {
      switch (action) {
        case 'sendRequest':
          await sendFriendRequest(profile.userName);
          // Non navigare automaticamente, lascia l'utente vedere il cambiamento
          // navigateToSentRequests();
          break;        case 'accept':
          if (profile.friendshipId) {
            await acceptFriendRequest(profile.friendshipId);
            // Naviga automaticamente alla sezione "I miei amici"
            navigateToFriends();
            return; // Non ricaricare il profilo se navigiamo via
          }
          break;
        case 'reject':
          if (profile.friendshipId) {
            await rejectFriendRequest(profile.friendshipId);
          }
          break;
        case 'remove':
          if (window.confirm(`Sei sicuro di voler rimuovere ${profile.userName} dagli amici?`)) {
            await removeFriend(profile.userId);
          }
          break;
        case 'block':
          if (profile.friendshipStatus === 'Blocked') {
            if (window.confirm(`Vuoi sbloccare ${profile.userName}?`)) {
              await blockUser(profile.userId); // toggle: sblocca
            }
          } else {
            if (window.confirm(`Sei sicuro di voler bloccare ${profile.userName}?`)) {
              await blockUser(profile.userId); // toggle: blocca
            }
          }
          break;      }
      
      // Breve pausa per permettere al backend di processare la richiesta
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Dopo qualsiasi azione, ricarica il profilo per garantire 
      // che l'interfaccia rifletta lo stato più aggiornato dal backend
      if (userName) {
        const userId = parseInt(userName);
        if (!isNaN(userId)) {
          await loadProfile(userId);
        } else {
          await loadProfileByUsername(userName);
        }
      }
    } catch (error) {
      console.error('Errore durante l\'azione:', error);
    }
  };

  const getActionButtons = () => {
    if (!profile || (!profile.acceptsFriendRequests && !profile.isFriend && profile.friendshipStatus !== 'Blocked')) return null;
    switch (profile.friendshipStatus) {      case 'Pending':
        // Se l'utente corrente ha inviato la richiesta, mostra solo messaggio di attesa
        if (profile.isRequestSender) {
          return (
            <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-300">
              <span className="text-sm">Richiesta di amicizia inviata</span>
            </div>
          );
        }
        // Se l'utente corrente ha ricevuto la richiesta, mostra i bottoni accetta/rifiuta
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleAction('accept')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <UserCheck className="h-4 w-4" />
              Accetta Richiesta
            </button>
            <button
              onClick={() => handleAction('reject')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <UserX className="h-4 w-4" />
              Rifiuta
            </button>
          </div>
        );case 'Accepted':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleAction('remove')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <UserMinus className="h-4 w-4" />
              Rimuovi Amico
            </button>
            <button
              onClick={() => handleAction('block')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Ban className="h-4 w-4" />
              Blocca
            </button>
          </div>        );
      
      case 'Rejected':
        return (
          <div className="flex gap-2">
            <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg border border-red-300">
              <span className="text-sm">Richiesta rifiutata</span>
            </div>
            <button
              onClick={() => handleAction('sendRequest')}
              className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Riprova
            </button>
          </div>
        );
      case 'Blocked':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleAction('block')}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
            >
              <Ban className="h-4 w-4" />
              Sblocca
            </button>
          </div>
        );
      default:
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleAction('sendRequest')}
              className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Aggiungi Amico
            </button>
            <button
              onClick={() => handleAction('block')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Ban className="h-4 w-4" />
              Blocca
            </button>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-primary-bg font-secondary ${className}`}>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="animate-pulse">
            <div className="bg-secondary-bg rounded-lg p-6 mb-10">
              <div className="h-8 bg-tertiary-bg rounded mb-4"></div>
              <div className="flex gap-8">
                <div className="w-32 h-32 bg-tertiary-bg rounded-full"></div>
                <div className="flex-1">
                  <div className="h-8 bg-tertiary-bg rounded mb-2"></div>
                  <div className="h-4 bg-tertiary-bg rounded mb-2"></div>
                  <div className="h-16 bg-tertiary-bg rounded"></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <div className="h-24 bg-secondary-bg rounded"></div>
              <div className="h-24 bg-secondary-bg rounded"></div>
              <div className="h-24 bg-secondary-bg rounded"></div>
              <div className="h-24 bg-secondary-bg rounded"></div>
            </div>
            <div className="h-64 bg-secondary-bg rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={`min-h-screen bg-primary-bg font-secondary ${className}`}>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center py-20">
            <User className="h-16 w-16 mx-auto mb-6 text-text-secondary opacity-50" />
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              Profilo non trovato
            </h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              {error || 'L\'utente richiesto non esiste o non è disponibile.'}
            </p>
            <button
              onClick={() => navigate('/friends')}
              className="px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna agli Amici
            </button>
          </div>
        </div>
      </div>    );
  }
  return (
    <div className={`min-h-screen bg-primary-bg font-secondary ${className}`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">        {/* Header del profilo pubblico */}
        <ProfileHeader
          userProfile={profile}
          isProfilePrivate={profile.isProfilePrivate}
          isOwnProfile={false}
          backButton={
            <button
              onClick={() => navigate('/friends')}
              className="px-4 py-2 bg-secondary-bg text-text-primary rounded-lg hover:bg-tertiary-bg transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna agli Amici
            </button>
          }
          actionButton={getActionButtons()}
        />
        
        {/* Se il profilo è privato e non siamo amici, mostra solo il messaggio di privacy */}
        {profile.isProfilePrivate && !profile.isFriend ? (
          <div className="mt-6 p-6 bg-secondary-bg border border-border-color rounded-lg">
            <div className="flex items-center gap-3 text-text-primary mb-2">
              <span className="font-medium text-lg">Profilo Privato</span>
            </div>
            <p className="text-text-secondary">
              Questo utente ha un profilo privato. Per vedere i contenuti del profilo, 
              devi essere amico di questo utente.
            </p>
          </div>
        ) : (
          <>
            {/* Statistiche - mostrate solo se il profilo è pubblico o siamo amici */}
            <ProfileStats
              stats={profile.stats}
              userProfile={profile}
              isPrivate={!profile.canViewStats}
              showPrivacyIndicator={!profile.isFriend}
              title="Statistiche di gioco"
            />            {/* Diario di gioco - mostrato solo se il profilo è pubblico o siamo amici */}
            {loadingActivities ? (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-text-primary font-primary">Diario di gioco</h2>
                </div>
                <div className="bg-secondary-bg rounded-lg p-6">
                  <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mx-auto mb-4"></div>
                    <p className="text-text-secondary">Caricamento attività...</p>
                  </div>
                </div>
              </div>
            ) : (
              <ProfileDiary
                activities={activities}
                selectedYear={selectedYear}
                activeFilters={activeFilters}
                diaryStats={placeholderDiaryStats}
                months={months}
                isPrivate={!profile.canViewDiary}
                showPrivacyIndicator={!profile.isFriend}
                onYearChange={setSelectedYear}
                onFilterChange={handleFilterChange}
                isOwnProfile={false}
                isFriend={profile.isFriend}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PublicProfileView;
