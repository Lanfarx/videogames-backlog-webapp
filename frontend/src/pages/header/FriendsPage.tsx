import React, { useState, useEffect, useRef } from 'react';
import { Users, Search, Bell, Settings } from 'lucide-react';
import FriendsList from '../../components/friends/FriendsList';
import FriendRequests, { FriendRequestsRef } from '../../components/friends/FriendRequests';
import UserSearch from '../../components/friends/UserSearch';
import { useFriends, usePendingRequests } from '../../store/hooks/friendshipHooks';
import { useNavigate } from 'react-router-dom';
import { FriendsSection, RequestsSubSection } from '../../store/hooks/navigationHooks';

const FriendsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [requestsSubSection, setRequestsSubSection] = useState<RequestsSubSection>('received');
  const navigate = useNavigate();
  const friendRequestsRef = useRef<FriendRequestsRef | null>(null);
  
  const { loadFriends } = useFriends();
  const { loadPendingRequests, requests: pendingRequests } = usePendingRequests();
  useEffect(() => {
    // Carica i dati iniziali
    loadFriends();
    loadPendingRequests();
  }, [loadFriends, loadPendingRequests]);

  // Listener per eventi di navigazione personalizzati
  useEffect(() => {
    const handleNavigation = (event: CustomEvent<{ section: FriendsSection; subSection?: RequestsSubSection }>) => {
      const { section, subSection } = event.detail;
      
      setActiveTab(section);
      
      if (section === 'requests' && subSection) {
        setRequestsSubSection(subSection);
        // Se il componente FriendRequests è già montato, aggiorna anche il suo stato
        if (friendRequestsRef.current) {
          friendRequestsRef.current.setActiveTab(subSection);
        }
      }
    };

    window.addEventListener('navigateToFriendsSection', handleNavigation as EventListener);
    
    return () => {
      window.removeEventListener('navigateToFriendsSection', handleNavigation as EventListener);
    };
  }, []);

  const pendingRequestsCount = pendingRequests.filter(req => req.status === 'Pending').length;

  const tabConfig = [
    {
      id: 'friends' as const,
      label: 'I Miei Amici',
      icon: Users,
      badge: null
    },
    {
      id: 'requests' as const,
      label: 'Richieste',
      icon: Bell,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null
    },
    {
      id: 'search' as const,
      label: 'Cerca Utenti',
      icon: Search,
      badge: null
    }
  ];

  return (
    <div className="min-h-screen bg-primary-bg">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-accent-primary" />
              <h1 className="text-3xl font-bold text-text-primary">
                Amici
              </h1>
            </div>
            
            {/* Azioni rapide */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigate('/settings');
                }}
                className="px-4 py-2 bg-secondary-bg text-text-primary rounded-lg hover:bg-hover-color transition-colors flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Privacy
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-secondary-bg rounded-lg p-1 flex">
            {tabConfig.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 relative px-4 py-3 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-accent-primary text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-hover-color'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenuto principale */}
        <div className="space-y-6">
          {activeTab === 'friends' && (
            <div>
              <FriendsList />
            </div>
          )}          {activeTab === 'requests' && (
            <div>
              <FriendRequests 
                ref={friendRequestsRef}
                initialActiveTab={requestsSubSection}
              />
            </div>
          )}

          {activeTab === 'search' && (
            <div>
              <UserSearch />
            </div>
          )}
        </div>

        {/* Info footer */}
        <div className="mt-12 p-6 bg-secondary-bg rounded-lg border border-border-color">
          <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Settings className="h-5 w-5 text-accent-primary" />
            Gestione Privacy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-text-primary mb-2">
                Richieste di Amicizia
              </h4>
              <p className="text-text-secondary">
                Controlla chi può inviarti richieste di amicizia nelle impostazioni del profilo.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-text-primary mb-2">
                Visibilità Profilo
              </h4>
              <p className="text-text-secondary">
                Imposta se il tuo profilo è pubblico o visibile solo agli amici.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-text-primary mb-2">
                Condivisione Dati
              </h4>
              <p className="text-text-secondary">
                Scegli quali informazioni condividere: statistiche, diario, attività.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;
